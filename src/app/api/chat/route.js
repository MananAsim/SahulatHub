import { SAHULAT_SYSTEM_PROMPT, getFallbackResponse } from '@/lib/chatKnowledge';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/sahulat-chat';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * POST /api/chat
 * Body: { messages: [{role, content}], role: 'client'|'worker', useN8n?: boolean }
 * 
 * Strategy:
 *  1. Try n8n webhook first (handles advanced workflow, memory, etc.)
 *  2. Fallback to direct Ollama API
 *  3. Final fallback: rule-based knowledge response
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { messages = [], role = 'client', sessionId, useN8n = true } = body;

        // ── 1. Try n8n webhook ───────────────────────────────────────────────
        if (useN8n) {
            try {
                const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages,
                        role,
                        sessionId: sessionId || `sahulat-${Date.now()}`,
                        systemPrompt: SAHULAT_SYSTEM_PROMPT(role),
                        model: OLLAMA_MODEL,
                    }),
                    signal: AbortSignal.timeout(30000), // 30s timeout
                });

                if (n8nResponse.ok) {
                    const data = await n8nResponse.json();
                    // n8n can return various structures — normalize
                    const reply =
                        data?.output ||
                        data?.message ||
                        data?.text ||
                        data?.response ||
                        (Array.isArray(data) && data[0]?.output) ||
                        null;

                    if (reply) {
                        return Response.json({
                            success: true,
                            message: reply,
                            source: 'n8n',
                        });
                    }
                }
            } catch (n8nError) {
                console.warn('[Chat] n8n unavailable, falling back to direct Ollama:', n8nError.message);
            }
        }

        // ── 2. Direct Ollama API ─────────────────────────────────────────────
        try {
            // Build Ollama chat messages with system prompt
            const ollamaMessages = [
                { role: 'system', content: SAHULAT_SYSTEM_PROMPT(role) },
                // Map frontend messages to Ollama format
                ...messages.map((m) => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content,
                })),
            ];

            const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    messages: ollamaMessages,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 512,
                    },
                }),
                signal: AbortSignal.timeout(60000), // 60s for local model
            });

            if (ollamaResponse.ok) {
                const ollamaData = await ollamaResponse.json();
                const reply = ollamaData?.message?.content || null;

                if (reply) {
                    return Response.json({
                        success: true,
                        message: reply,
                        source: 'ollama',
                    });
                }
            }
        } catch (ollamaError) {
            console.warn('[Chat] Ollama unavailable, using fallback:', ollamaError.message);
        }

        // ── 3. Rule-based fallback ────────────────────────────────────────────
        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
        const fallbackReply = getFallbackResponse(lastUserMsg);

        return Response.json({
            success: true,
            message: fallbackReply,
            source: 'fallback',
            note: 'Ollama and n8n are currently offline. Start Ollama with: ollama serve',
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
    const checks = { n8n: false, ollama: false };

    try {
        const r = await fetch(N8N_WEBHOOK_URL.replace('/webhook/sahulat-chat', '/healthz'),
            { signal: AbortSignal.timeout(2000) });
        checks.n8n = r.ok;
    } catch { /* offline */ }

    try {
        const r = await fetch(`${OLLAMA_URL}/api/tags`,
            { signal: AbortSignal.timeout(2000) });
        checks.ollama = r.ok;
    } catch { /* offline */ }

    return Response.json({
        success: true,
        services: checks,
        model: OLLAMA_MODEL,
    });
}
