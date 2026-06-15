import {
  mockExtractedScreenshotClaims,
  mockExtractedVoiceClaims,
} from "../data/mockClaims";
import type { Claim, ClaimSource } from "../types";

const MOCK_DELAY_MS = 1200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractClaims(
  _text: string,
  source: ClaimSource,
): Promise<Claim[]> {
  await delay(MOCK_DELAY_MS);

  const claims =
    source === "screenshot"
      ? mockExtractedScreenshotClaims
      : mockExtractedVoiceClaims;

  return claims.map((claim) => ({
    ...claim,
    extractedAt: new Date().toISOString(),
  }));
}
