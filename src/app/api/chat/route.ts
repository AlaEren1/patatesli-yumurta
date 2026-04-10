import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, scenario, language, level, uiLanguage } = await req.json();

    const apiKey = process.env.LLM_API_KEY;
    
    // Fallback Mock Logic
    if (!apiKey || apiKey === 'your_llm_api_key_here') {
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({
        reply: uiLanguage === 'Turkish' ? "¡Hola! ¿En qué puedo ayudarte hoy en el aeropuerto?" : "Hola! ¿En qué puedo ayudarte hoy en el aeropuerto?", // Mock AI says same thing but we could differentiate
        analysis: uiLanguage === 'Turkish' ? "Harika bir başlangıç! Niyetinizi net bir şekilde ilettiniz." : "Great start! You communicated your intent clearly.",
        correction: null
      });
    }

    const lastUserMessage = messages[messages.length - 1].content;

    const systemPrompt = `
      You are an expert language teacher and immersive roleplay partner.
      
      SCENARIO: ${scenario}
      TARGET LANGUAGE: ${language}
      STUDENT PROFICIENCY: ${level}
      
      YOUR TASKS:
      1. Stay in character according to the scenario.
      2. Respond in ${language} at a ${level} level.
      3. Evaluate the student's last message: "${lastUserMessage}".
      4. Provide a supportive "analysis" in ${uiLanguage} (1 sentence).
      5. Provide a "correction" if they made a mistake or if there is a more natural way to say it in ${language}. If their message was perfect and natural, set correction to null.
      
      OUTPUT FORMAT:
      You must respond ONLY with a valid JSON object. No other text.
      JSON structure:
      {
        "reply": "your message in character in ${language}",
        "analysis": "one sentence of feedback in ${uiLanguage}",
        "correction": "corrected or more natural version of student sentence in ${language}, or null"
      }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(resultText);
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Chat API error", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
