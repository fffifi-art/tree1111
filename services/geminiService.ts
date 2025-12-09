import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// We initialize externally to ensure we can handle the case where key might be missing gracefully in UI (though mandated to exist)
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateLuxuryWish = async (): Promise<string> => {
  if (!ai) {
    return "May your holidays be filled with golden moments and emerald dreams.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Write a very short, poetic, luxurious, and elegant Christmas blessing (max 20 words). Use words like 'Gold', 'Light', 'Timeless', 'Opulence'.",
      config: {
        temperature: 0.9,
      }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A timeless glow upon your festive season.";
  }
};