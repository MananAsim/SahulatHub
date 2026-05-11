import { writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_WHISPER_MODEL = 'whisper-large-v3-turbo';

/**
 * POST /api/chat/voice
 * Accepts: multipart/form-data with an "audio" blob field
 * Returns: { text: string } — the Groq Whisper transcription
 */
export async function POST(request) {
    try {
        if (!GROQ_API_KEY) {
            return Response.json({ success: false, text: '', error: 'Groq API key not configured' }, { status: 500 });
        }

        const formData = await request.formData();
        const audioBlob = formData.get('audio');

        if (!audioBlob) {
            return Response.json({ success: false, error: 'No audio file provided' }, { status: 400 });
        }

        // Convert blob to buffer and save to a temp file for Groq upload
        const arrayBuffer = await audioBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempPath = join(os.tmpdir(), `sahal_voice_${Date.now()}.webm`);
        await writeFile(tempPath, buffer);

        // Build FormData for the Groq Whisper API
        const groqFormData = new FormData();
        const file = new Blob([buffer], { type: 'audio/webm' });
        groqFormData.append('file', file, 'voice.webm');
        groqFormData.append('model', GROQ_WHISPER_MODEL);
        groqFormData.append('response_format', 'json');
        groqFormData.append('language', 'en'); // optimize for English

        const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
            body: groqFormData,
            signal: AbortSignal.timeout(15000),
        });

        if (!whisperRes.ok) {
            const errText = await whisperRes.text();
            console.error('[Whisper] Groq error:', errText);
            return Response.json({ success: false, error: 'Transcription failed', details: errText }, { status: 500 });
        }

        const { text } = await whisperRes.json();

        return Response.json({ success: true, text: text?.trim() || '' });

    } catch (error) {
        console.error('[Voice API] Error:', error.message);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
