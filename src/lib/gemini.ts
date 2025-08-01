import { GoogleGenAI } from '@google/genai';
import { env } from '../services/env.js';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const getCompletion = async (query: string) => {
  const { text } = await ai.models.generateContent({
    model: env.GEMINI_CHAT_MODEL,
    contents: query,
  });
  return text;
};

export const getCompletionWithRAG = async (query: string, context: string) => {
  const prompt = `
  You are a product search expert. You will be given a set of product data and a user's request.
  Your task is to extract the most relevant details from the provided product data to answer the user's query.

  ### Product Data
  ${context}

  ### User Query
  ${query}

  **Instructions:**
  1.  Carefully read the "Product Data" and the "User Query."
  2.  Identify the products and attributes that are most relevant to the query.
  3.  Synthesize a clear and helpful response using only the information from the "Product Data."
  4.  Do not include any information that is not explicitly mentioned in the context.
  5.  If a product or attribute mentioned in the query cannot be found in the provided data, politely inform the user that the information is unavailable.
  6.  Format the response clearly, using bullet points or a short paragraph.
  `;
  const { text } = await ai.models.generateContent({
    model: env.GEMINI_CHAT_MODEL,
    contents: {
      role: 'system',
      text: prompt,
    },
  });
  return text;
};
