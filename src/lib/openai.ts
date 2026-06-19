import dns from "node:dns";
import OpenAI from "openai";

dns.setDefaultResultOrder("ipv4first");

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const baseURL = process.env.OPENAI_BASE_URL?.trim() || undefined;

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      baseURL,
      timeout: 120_000,
      maxRetries: 3,
    });
  }

  return openaiClient;
}

export function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  return Boolean(apiKey && !apiKey.includes("your-"));
}

/** Call after .env.local changes so the client picks up new settings */
export function resetOpenAIClient(): void {
  openaiClient = null;
}
