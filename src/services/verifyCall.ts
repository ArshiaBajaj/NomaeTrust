import type { CallVerificationResult, VoicePassport } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function verifyCallApi(input: {
  scenario: "registered" | "unregistered";
  challengeResponse?: string;
  expectedChallengeCode?: string;
  passport?: VoicePassport | null;
}): Promise<CallVerificationResult> {
  const response = await fetch(`${API_BASE}/api/verify-call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Call verification failed");
  }

  return response.json() as Promise<CallVerificationResult>;
}
