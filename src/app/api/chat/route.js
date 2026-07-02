import { SAHULAT_SYSTEM_PROMPT, getFallbackResponse } from '@/lib/chatKnowledge';
import { TOOL_SCHEMAS, executeTool } from './tools';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_TEXT_MODEL = 'llama-3.1-8b-instant'; // Much higher free tier limits (30k TPM)
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_WHISPER_MODEL = 'whisper-large-v3-turbo';
const GROQ_BASE = 'https://api.groq.com/openai/v1';

const groqHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GROQ_API_KEY}`,
};

/**
 * POST /api/chat
 * Body: { messages, role, token, image_base64? }
 *
 * Architecture:
 *  1. Groq Llama 3.3 with Function Calling (Agentic "Hands")
 *  2. Groq Vision model if image_base64 present (Multimodal "Eyes")
 *  3. Rule-based fallback if Groq is unavailable
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { messages = [], role = 'client', token, image_base64 } = body;

        if (!GROQ_API_KEY) {
            // Graceful fallback if key missing
            const lastMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
            return Response.json({ success: true, message: getFallbackResponse(lastMsg), source: 'fallback' });
        }

        // ── Route: VISION if image is present ────────────────────────────────
        if (image_base64) {
            return await handleVision({ messages, image_base64, role });
        }

        // ── Route: AGENTIC TEXT with Function Calling ─────────────────────────
        return await handleAgenticText({ messages, role, token });

    } catch (error) {
        console.error('[Chat API] Unhandled error:', error);
        return Response.json({ success: false, message: 'Chat service error. Please try again.' }, { status: 500 });
    }
}

// ── Vision Handler ─────────────────────────────────────────────────────────────
async function handleVision({ messages, image_base64, role }) {
    try {
        const systemPrompt = SAHULAT_SYSTEM_PROMPT(role) + `\n\nYou are now in VISION MODE. The user has uploaded an image of their home issue. Analyze it like an expert technician. Identify the exact problem, name the part/system affected, estimate the severity (Minor/Moderate/Major), suggest the service category (plumbing/electrical/ac_repair/cleaning/painting/carpentry), and give a rough price range in Pakistani Rupees. End by asking if they want you to book a worker now.`;

        const visionMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-4).map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            })),
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Please analyze this image of my home problem.' },
                    { type: 'image_url', image_url: { url: image_base64 } },
                ],
            },
        ];

        const res = await fetch(`${GROQ_BASE}/chat/completions`, {
            method: 'POST',
            headers: groqHeaders,
            body: JSON.stringify({
                model: GROQ_VISION_MODEL,
                messages: visionMessages,
                temperature: 0.5,
                max_tokens: 1024,
            }),
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Vision] Groq error:', err);
            return Response.json({ success: true, message: 'I could not analyze that image right now. Please describe the problem in text and I will help you!', source: 'vision_error' });
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'Image analyzed but no response generated.';
        return Response.json({ success: true, message: reply, source: 'groq_vision' });

    } catch (err) {
        console.error('[Vision] Error:', err.message);
        return Response.json({ success: true, message: 'Could not process the image. Please describe the issue and I\'ll help!', source: 'vision_error' });
    }
}

// ── Agentic Text Handler with Function Calling Loop ───────────────────────────
async function handleAgenticText({ messages, role, token }) {
    try {
        const groqMessages = [
            { role: 'system', content: SAHULAT_SYSTEM_PROMPT(role) },
            ...messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            })),
        ];

        // First call — may return tool_calls
        let res = await fetch(`${GROQ_BASE}/chat/completions`, {
            method: 'POST',
            headers: groqHeaders,
            body: JSON.stringify({
                model: GROQ_TEXT_MODEL,
                messages: groqMessages,
                temperature: 0.7,
                max_tokens: 1024,
                tools: TOOL_SCHEMAS,
                tool_choice: 'auto',
            }),
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
            throw new Error(`Groq error: ${res.status}`);
        }

        let data = await res.json();
        let choice = data.choices?.[0];

        // ── Agentic Loop: execute tools and re-query ─────────────────────────
        if (choice?.finish_reason === 'tool_calls' && choice?.message?.tool_calls?.length > 0) {
            // Add the assistant's tool-call message to context
            groqMessages.push(choice.message);

            // Execute each tool call in parallel
            let frontendAction = null;

            const toolResults = await Promise.all(
                choice.message.tool_calls.map(async (tc) => {
                    const args = JSON.parse(tc.function.arguments || '{}');
                    
                    if (tc.function.name === 'navigate_user') {
                        frontendAction = { type: 'REDIRECT', url: args.url };
                    }

                    const result = await executeTool(tc.function.name, args, token);
                    return {
                        role: 'tool',
                        tool_call_id: tc.id,
                        name: tc.function.name,
                        content: JSON.stringify(result),
                    };
                })
            );

            // Add tool results to context and make the second call
            groqMessages.push(...toolResults);

            res = await fetch(`${GROQ_BASE}/chat/completions`, {
                method: 'POST',
                headers: groqHeaders,
                body: JSON.stringify({
                    model: GROQ_TEXT_MODEL,
                    messages: groqMessages,
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
                signal: AbortSignal.timeout(20000),
            });

            if (!res.ok) throw new Error(`Groq error on tool resolution: ${res.status}`);
            data = await res.json();
            choice = data.choices?.[0];
        }

        const reply = choice?.message?.content;
        if (!reply) throw new Error('Empty response from Groq');

        return Response.json({ success: true, message: reply, source: 'groq', action: frontendAction });

    } catch (err) {
        console.warn('[AgenticText] Error:', err.message);
        const lastMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
        
        // If it's a rate limit error, answer using fallback knowledge but keep the rate_limit badge
        if (err.message.includes('429')) {
             return Response.json({ success: true, message: getFallbackResponse(lastMsg), source: 'rate_limit' });
        }
        return Response.json({ success: true, message: getFallbackResponse(lastMsg), source: 'fallback' });
    }
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function GET() {
    return Response.json({
        success: true,
        engine: 'Groq SOTA Agentic',
        text_model: GROQ_TEXT_MODEL,
        vision_model: GROQ_VISION_MODEL,
        whisper_model: GROQ_WHISPER_MODEL,
        tools: TOOL_SCHEMAS.map(t => t.function.name),
        status: GROQ_API_KEY ? 'online' : 'missing_api_key',
    });
}
