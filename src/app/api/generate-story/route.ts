import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { language, level, topic } = await req.json();

    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey || apiKey === 'your_llm_api_key_here') {
      // Mock mode since no valid api key is provided
      await new Promise(r => setTimeout(r, 1500)); // simulate delay
      return NextResponse.json({
        story: `El anciano detective miró por la ventana del tren. La lluvia golpeaba el cristal suavemente. Sabía que el ladrón estaba a bordo, escondido entre los pasajeros del vagón de primera clase. Este era su último caso antes de jubilarse, y no pensaba fallar. (Mock ${level} ${language} story about: ${topic}).`
      });
    }

    // Call actual Gemini API endpoint via fetch
    const prompt = `Write a short story in ${language} at a ${level} proficiency level. The story should be about ${topic}. Keep it engaging and strictly at the requested difficulty level. Do not include English translations, just the pure ${language} text.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
    }

    const data = await response.json();
    const storyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "The AI failed to generate the story.";

    return NextResponse.json({ story: storyText });

  } catch (error: any) {
    console.error("AI Gen error", error);
    return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
  }
}
