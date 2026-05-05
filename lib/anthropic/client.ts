import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

export const groq = apiKey ? new Groq({ apiKey }) : null;

/** Groq model — Llama 3.3 70B is free and very capable */
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export function isAIConfigured(): boolean {
  return Boolean(apiKey);
}
