
import { GoogleGenAI } from "@google/genai";

// Fix: Strictly follow initialization guidelines for GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCelebrationMessage = async (winnerName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, enthusiastic, and festive one-sentence congratulations message in Chinese for a lottery winner named "${winnerName}". Use emojis! Keep it professional yet exciting.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      },
    });
    return response.text || `恭喜 ${winnerName} 成为今日的幸运锦鲤！🎉`;
  } catch (error) {
    console.error("Error generating celebration message:", error);
    return `恭喜 ${winnerName} 成为今日的幸运儿！🎊`;
  }
};
