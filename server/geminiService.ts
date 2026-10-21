import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  return key.trim();
}

export function parseGeminiError(err: any): string {
  if (!err) return 'Unknown error occurred communicating with AI service.';
  const rawMsg = typeof err === 'string' ? err : err.message || '';

  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error?.message) {
      if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
        return 'Gemini AI service is temporarily experiencing high demand (503). Please retry in a few moments.';
      }
      if (parsed.error.code === 429) {
        return 'Gemini API rate limit reached (429). Please wait briefly before scanning again.';
      }
      if (parsed.error.code === 400) {
        return 'Invalid request sent to AI service: ' + parsed.error.message;
      }
      return parsed.error.message;
    }
  } catch {
    // Not JSON string
  }

  if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE')) {
    return 'Gemini AI service is temporarily experiencing high demand (503).';
  }
  if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'Gemini API rate limit or quota exceeded (429).';
  }
  if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('403')) {
    return 'Server Gemini API key is unauthorized or invalid.';
  }
  if (rawMsg.includes('TIMEOUT') || rawMsg.includes('timed out')) {
    return 'Request to Gemini AI service timed out. Please try with a smaller code snippet.';
  }

  return rawMsg.length > 200 ? rawMsg.slice(0, 200) + '...' : rawMsg;
}

export interface GenerateGeminiOptions {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
  timeoutMs?: number;
}

export async function callGeminiWithFallback(options: GenerateGeminiOptions): Promise<{
  text: string;
  modelUsed: string;
}> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on this server environment.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  // Fast, reliable models per @google/genai guidelines
  // gemini-3.1-flash-lite provides fast (4-9s) structured analysis
  // gemini-3.8-flash provides high-reasoning fallback
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      // Generous timeout to avoid prematurely cutting off generative model responses
      const timeoutMs = options.timeoutMs || 25000;
      const apiCallPromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature !== undefined ? options.temperature : 0.2
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${model} request exceeded ${timeoutMs}ms limit`)), timeoutMs)
      );

      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      if (response && response.text) {
        return {
          text: response.text,
          modelUsed: model
        };
      }
    } catch (err: any) {
      lastError = err;
      // Proceed gracefully to the next model candidate
    }
  }

  throw lastError || new Error('All candidate Gemini models failed to respond.');
}
