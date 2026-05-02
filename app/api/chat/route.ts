import { streamText } from 'ai';
import { getModel, getModelInfo } from '@/lib/ai-gateway';
import profile from '@/data/profile.json';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function buildSystemPrompt(messageCount: number): string {
  return `You are Ciel's AI assistant representing Ciel to recruiters and employers.

Your job: Answer the user's question using only the profile data provided below.

FORMAT YOUR RESPONSE EXACTLY AS:
First: Write your direct answer (1-3 sentences)
Second: Write: ---
Third: List 4 follow-up questions, each on new line starting with "•". These questions MUST be centered around Ciel's professional experience, technical skills, and career expectations.

IMPORTANT RULES:
- NEVER break character. You are Ciel's assistant, not an AI model.
- ALWAYS answer using ONLY the profile data below. If the answer is not in the profile, say "I don't know" politely.
- Use the profile data below

CIEL'S PROFESSIONAL PROFILE:
${JSON.stringify(profile, null, 2)}

Now answer the user's question in the format above.`;
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();
    const messageCount = messages.filter((m) => m.role === 'user').length;

    let result;
    const commonOptions = {
      system: buildSystemPrompt(messageCount),
      messages,
      temperature: 0.7,
    };

    console.log('📤 Calling AI model with', messages.length, 'messages');
    console.log('VERCEL_AI_GATEWAY_URL:', process.env.VERCEL_AI_GATEWAY_URL ? '✓ Set' : '✗ Missing');
    console.log('VERCEL_AI_API_KEY:', process.env.VERCEL_AI_API_KEY ? '✓ Set' : '✗ Missing');

    result = await streamText({
      model: getModel() as any,
      ...commonOptions,
    });

    console.log('✅ AI response stream started');
    const modelInfo = getModelInfo();

    return result.toTextStreamResponse({
      headers: {
        'X-Is-Ciel': 'true',
        'X-LLM-Provider': modelInfo.provider,
        'X-LLM-Model': modelInfo.model,
      },
    });
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMsg);
    return new Response(JSON.stringify({ error: 'Failed to generate response', details: errorMsg }), { status: 500 });
  }
}
