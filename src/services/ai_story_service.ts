/**
 * AI Story Generator Service Outline
 * Responsible for calling the LLM to generate language-learning stories adapted to the user's level.
 */

export interface StoryParams {
  language: string;
  level: string; // e.g., 'A1', 'B2'
  topic: string;
}

export const generateStory = async ({ language, level, topic }: StoryParams): Promise<string> => {
  // Outline: In Phase 3, this will call Next.js API route that securely uses LLM_API_KEY
  console.log(`[AI] Generating ${level} ${language} story about ${topic}...`);
  
  // Minimal fetch abstraction over the LLM API (e.g. OpenAI/Gemini)
  /*
  const response = await fetch('/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, level, topic })
  });
  const data = await response.json();
  return data.story;
  */
  
  return Promise.resolve(`En un lugar de la Mancha, de cuyo nombre no quiero acordarme... (Simulated ${level} ${language} story about ${topic})`);
};
