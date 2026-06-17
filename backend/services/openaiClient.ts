import OpenAI from "openai";
import type { Fetch } from "openai/core";

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

let client: OpenAI | null = null;

type FetchInitWithDuplex = RequestInit & { duplex?: "half" };

/** Node fetch requires duplex when uploading multipart audio bodies. */
const fetchWithDuplex = (
  url: Parameters<typeof fetch>[0],
  init?: RequestInit,
): ReturnType<typeof fetch> => {
  if (init?.body) {
    return fetch(url, { ...init, duplex: "half" } as FetchInitWithDuplex);
  }
  return fetch(url, init);
};

export function getOpenAIClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new ConfigurationError(
      "OPENAI_API_KEY is not configured. Add your key to backend/.env",
    );
  }

  client = new OpenAI({
    apiKey,
    fetch: fetchWithDuplex as unknown as Fetch,
    maxRetries: 2,
    timeout: 120_000,
  });

  return client;
}

export function logOpenAIError(context: string, error: unknown): void {
  if (error instanceof OpenAI.APIConnectionError) {
    console.error(`[OpenAI] ${context} — connection error: ${error.message}`);
    if (error.cause) {
      console.error(`[OpenAI] ${context} — cause:`, error.cause);
    }
    return;
  }

  if (error instanceof OpenAI.RateLimitError) {
    console.error(`[OpenAI] ${context} — rate limit / quota: ${error.message}`);
    return;
  }

  if (error instanceof OpenAI.AuthenticationError) {
    console.error(`[OpenAI] ${context} — authentication failed: ${error.message}`);
    return;
  }

  if (error instanceof OpenAI.APIError) {
    console.error(
      `[OpenAI] ${context} — API error ${error.status}: ${error.message}`,
    );
    return;
  }

  console.error(`[OpenAI] ${context} — unexpected error:`, error);
}

export function toUserFacingOpenAIError(error: unknown): {
  status: number;
  message: string;
} {
  if (error instanceof ConfigurationError) {
    return { status: 503, message: error.message };
  }

  if (error instanceof OpenAI.APIConnectionError) {
    const cause = error.cause as NodeJS.ErrnoException | undefined;
    if (cause?.code === "ECONNRESET" || cause?.code === "ETIMEDOUT") {
      return {
        status: 422,
        message:
          "Could not process the audio file. It may be corrupt or in an unsupported format (use MP3, WAV, M4A, or WEBM).",
      };
    }
    return {
      status: 503,
      message:
        "Unable to reach OpenAI. Check your network connection and try again.",
    };
  }

  if (error instanceof OpenAI.RateLimitError) {
    return {
      status: 429,
      message:
        "OpenAI quota exceeded. Add billing or credits at platform.openai.com.",
    };
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return { status: 401, message: "Invalid OpenAI API key." };
  }

  if (error instanceof OpenAI.APIError) {
    return {
      status: error.status ?? 500,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: "Audio analysis failed" };
}

export function shouldFallbackToDemoMode(error: unknown): boolean {
  if (error instanceof ConfigurationError) {
    return true;
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return true;
  }

  if (error instanceof OpenAI.RateLimitError) {
    return true;
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return true;
  }

  if (error instanceof OpenAI.APIError) {
    const message = error.message.toLowerCase();
    if (error.status === 402 || error.status === 429) {
      return true;
    }
    if (
      message.includes("quota") ||
      message.includes("billing") ||
      message.includes("insufficient") ||
      message.includes("payment")
    ) {
      return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("openai_api_key") ||
      message.includes("quota") ||
      message.includes("billing") ||
      message.includes("connection error") ||
      message.includes("network")
    ) {
      return true;
    }
  }

  return false;
}
