"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fixGrammar(htmlContent: string) {
  try {
    const adminPrompt = 'Correct the word, "Maharaja" or similar to "Maharaj"';

    const prompt = `
You are an expert editor. The user has provided an HTML document.
Your task is to fix spelling and grammar mistakes in the visible text while STRICTLY preserving the EXACT HTML structure, tags, classes, and newlines. 
Do not add any markdown formatting like \`\`\`html around the output. Output ONLY the corrected HTML string.
Do not change stylistic or aesthetic tags.

Additional Custom Rules:
${adminPrompt}

Here is the HTML content to fix:
${htmlContent}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return { success: true, text: response.text };
  } catch (error) {
    console.error("Failed to fix grammar:", error);
    return { success: false, error: "Failed to process text with AI." };
  }
}
