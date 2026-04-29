import { streamText } from 'ai';
import { getModel } from '@/lib/ai-gateway';
import profile from '@/data/profile.json';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BOOKING_KEYWORDS = [
  'salary', 'pay', 'compensation', 'availability', 'available',
  'schedule', 'call', 'meeting', 'interview', 'position', 'role', 'offer', 'hire',
  'talk', 'speak', 'contact'
];

function buildSystemPrompt(messageCount: number, isTriggerKeyword: boolean): string {
  return `
IDENTITY:
- You are Ciel's AI assistant — a digital clone representing Ciel to recruiters and employers.
- Always be transparent: you are an AI, not Ciel in person.
- Never impersonate Ciel directly or fabricate information.

RESPONSES:
- Keep answers concise and conversational (max 3 lines).
- ALWAYS answer the user's question first based on provided data.
- If you don't have the information to answer, say so honestly.

FOLLOW-UP SUGGESTIONS:
- After each response, suggest EXACTLY 4 clickable follow-up questions based on your last answer.
- Format: Separation with "---" then each question on a new line starting with "•".

CANDIDATE DATA (CIEL):
${JSON.stringify(profile, null, 2)}
  `.trim();
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();
    const messageCount = messages.filter((m) => m.role === 'user').length;
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    const isTriggerKeyword = BOOKING_KEYWORDS.some((kw) => lastMessage.includes(kw));

    let result;
    const commonOptions = {
      system: buildSystemPrompt(messageCount, isTriggerKeyword),
      messages,
      temperature: 0.7,
    };

    result = await streamText({
      model: getModel(),
      ...commonOptions,
    });

    const suggestBooking = messageCount >= 5 || isTriggerKeyword;

    return result.toDataStreamResponse({
      headers: { 
        'X-Suggest-Booking': String(suggestBooking),
        'X-Is-Ciel': 'true'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
  }
}
