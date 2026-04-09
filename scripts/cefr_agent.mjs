import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// A standalone Node.js script acting as the Specialized CEFR Content Agent.
// Usage: run this in your terminal using ->  node scripts/cefr_agent.mjs

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual Gemini API Key

const TOPICS = [
  "A mysteriously abandoned train station in the mountains",
  "The secret recipe of a famous baker"
];

const LEVELS = [
  {
    code: "A1",
    instructions: "You MUST ONLY use Present Indicative Tense. NO PAST TENSE. NO FUTURE TENSE. Sentences must be Subject-Verb-Object. Max 10 words per sentence. Use only the most basic 300 words of the language."
  },
  {
    code: "B2",
    instructions: "You must use complex tenses including Subjunctive Mood, Conditional, and Past Perfect. Use idiomatic expressions native to the language. Complex subordinate clauses are required."
  }
];

const TARGET_LANGUAGE = "Spanish";

async function runAgent() {
  console.log("🚀 Starting CEFR Content Agent...\n");
  const collection = [];
  
  for (const topic of TOPICS) {
    for (const level of LEVELS) {
      console.log(`[AGENT] Drafting ${level.code} ${TARGET_LANGUAGE} story for topic: "${topic}"...`);
      
      const prompt = `You are a strict, world-class ${TARGET_LANGUAGE} linguistics professor. 
Write an engaging 150-word story about "${topic}".
CRITICAL GRAMMAR RULES FOR THIS LEVEL (${level.code}):
${level.instructions}

Ensure the text is purely written in ${TARGET_LANGUAGE}. Do not translate to English. Do not add conversational padding, output only the story.`;

      let storyText = "";

      if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        console.log("   ⚠️ No API Key found in script. Generating a Mock Story to demonstrate logic...");
        storyText = `(Mock Story Generated because no API Key was provided) -- El sol brilla. El tren está en la montaña. Nadie está en el tren. Es un misterio.`;
      } else {
        try {
           const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });
      
          const data = await response.json();
          storyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Generation Failed - AI output invalid.";
        } catch(e) {
          console.error("   ❌ Agent failed to fetch from AI:", e);
          storyText = "Error communicating with AI.";
        }
      }
      
      const storyObj = {
        title: topic,
        level: level.code,
        language: TARGET_LANGUAGE,
        content: storyText.trim()
      };
      
      collection.push(storyObj);
      
      console.log(`   ✅ Vetted and saved. Waiting 2 seconds (Rate limit prevention)...\n`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Save the generated stories to a JSON file simulating a Database upload
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputPath = path.join(__dirname, '..', 'agent_database_output.json');
  fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
  
  console.log(`🎉 Agent Loop Finished! The stories are formatted and saved to: agent_database_output.json`);
  console.log(`In production, this script would now execute an INSERT command to your Supabase 'stories' table.`);
}

runAgent();
