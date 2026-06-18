import type { CallVerificationResult, VoicePassport } from "../types";
import { getStoredSessionToken } from "./trustCircleApi";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function verifyCallApi(input: {
  scenario: "registered" | "unregistered";
  challengeResponse?: string;
  expectedChallengeCode?: string;
  passport?: VoicePassport | null;
}): Promise<CallVerificationResult> {
  const token = getStoredSessionToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/verify-call`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...input,
      sessionToken: token ?? undefined,
    }),
  });

  if (!response.ok) {
    throw new Error("Call verification failed");
  }

  return response.json() as Promise<CallVerificationResult>;
}
