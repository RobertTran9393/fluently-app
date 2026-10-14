import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, scenarioId, history, apiKey } = await request.json();

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return NextResponse.json(
        { error: 'Chưa có Gemini API Key.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a warm, encouraging, friendly native English speaker acting as a conversational practice partner for a Vietnamese beginner learner.
Current scenario context: "${scenarioId || 'General friendly conversation'}".

CRITICAL INSTRUCTIONS:
1. Speak in natural, everyday, simple spoken English suitable for A1-A2 beginners. Keep responses under 2-3 sentences.
2. If the user made a grammar or wording mistake, gently provide a "grammarTip" in Vietnamese showing the natural way native speakers say it.
3. Provide an accurate Vietnamese translation for your response.
4. Provide 2 simple, natural suggested responses the user could say next (with English and Vietnamese translation).
5. Always output strict JSON with keys:
{
  "replyEn": "Your English reply",
  "replyVi": "Bản dịch tiếng Việt của câu trả lời",
  "grammarTip": "Mẹo sửa ngữ pháp hoặc cách nói tự nhiên (nếu có lỗi, nếu không có lỗi thì để null)",
  "suggestedNextReplies": [
    { "en": "option 1 en", "vi": "bản dịch vi 1" },
    { "en": "option 2 en", "vi": "bản dịch vi 2" }
  ]
}`;

    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const h of history || []) {
      if (!h.text) continue;
      const role = h.role === 'model' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${h.text}`;
      } else {
        contents.push({ role, parts: [{ text: h.text }] });
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\nUser said: "${message}". Please reply in JSON.`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: `User said: "${message}". Please reply in JSON.` }],
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json({ error: 'Không nhận được phản hồi từ AI' }, { status: 500 });
    }

    const cleanJson = candidateText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('API route error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Lỗi xử lý AI';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
