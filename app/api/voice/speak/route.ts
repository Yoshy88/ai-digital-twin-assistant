export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = 'TxGEqnHWrfWFTfGW9XjX';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

type SpeakRequest = {
  text?: string;
};

export async function POST(req: Request) {
  try {
    const { text }: SpeakRequest = await req.json();

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
    const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;

    const ttsResponse = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: modelId,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      return new Response(
        JSON.stringify({ error: 'ElevenLabs TTS failed', status: ttsResponse.status, details: errorText }),
        {
          status: ttsResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(ttsResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Failed to synthesize speech', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
