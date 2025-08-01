import { GoogleGenAI } from '@google/genai';
import { env } from '../services/env.js';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const getCompletion = async (prompt: string) => {
  const { text } = await ai.models.generateContent({
    model: env.GEMINI_CHAT_MODEL,
    contents: prompt,
  });
  return text;
};
