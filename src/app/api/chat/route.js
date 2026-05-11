import { SAHULAT_SYSTEM_PROMPT, getFallbackResponse } from '@/lib/chatKnowledge';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * POST /api/chat
 * Architecture: SOTA Groq Llama 3.3 Integration
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { messages = [], role = 'client' } = body;

        // ── 1. SOTA GROQ API ENGINE (Primary) ─────────────────────────────────
        if (GROQ_API_KEY) {
            try {
                // Build OpenAI-compatible chat messages with the exact project system prompt
                const groqMessages = [
                    { role: 'system', content: SAHULAT_SYSTEM_PROMPT(role) },
                    ...messages.map((m) => ({
                        role: m.role === 'user' ? 'user' : 'assistant',
                        content: m.content,
                    })),
                ];

                const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: groqMessages,
                        temperature: 0.7,
                        max_tokens: 1024,
                    }),
                    signal: AbortSignal.timeout(15000), // SOTA inference is fast, 15s max
                });

                if (groqResponse.ok) {
                    const data = await groqResponse.json();
                    const reply = data.choices?.[0]?.message?.content;
                    if (reply) {
                        return Response.json({
                            success: true,
                            message: reply,
                            source: 'groq',
                        });
                    }
                } else {
                    console.error('[Chat] Groq API error:', await groqResponse.text());
                }
            } catch (groqError) {
                console.warn('[Chat] Groq unavailable, falling back:', groqError.message);
            }
        }

        // ── 2. Rule-based Fallback (No Internet / No API Key) ────────────────
        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
        const fallbackReply = getFallbackResponse(lastUserMsg);

        return Response.json({
            success: true,
            message: fallbackReply,
            source: 'fallback',
        });

    } catch (error) {
        console.error('[Chat API] Unhandled error:', error);
        return Response.json(
            { success: false, message: 'Chat service error. Please try again.' },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return Response.json({
        success: true,
        engine: 'Groq (Llama 3.3)',
        model: GROQ_MODEL,
        status: GROQ_API_KEY ? 'online' : 'missing_api_key'
    });
}

