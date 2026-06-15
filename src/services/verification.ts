import {
  mockCallVerificationResults,
  mockScreenshotEvidenceCards,
  mockVoiceEvidenceCards,
} from "../data/mockClaims";
import type {
  CallVerificationResult,
  Claim,
  ClaimSource,
  EvidenceCard,
  VerificationPipelineResult,
} from "../types";
import { extractClaims } from "./claims";
import { extractTextFromScreenshot, transcribeAudio } from "./transcription";

const MOCK_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEvidenceCards(
  _claims: Claim[],
  source: ClaimSource,
): Promise<EvidenceCard[]> {
  await delay(MOCK_DELAY_MS);

  const cards =
    source === "screenshot"
      ? mockScreenshotEvidenceCards
      : mockVoiceEvidenceCards;

  return cards.map((card) => ({
    ...card,
    verifiedAt: new Date().toISOString(),
  }));
}

export async function runVoiceVerificationPipeline(
  file: File,
): Promise<VerificationPipelineResult> {
  const transcription = await transcribeAudio(file);
  const claims = await extractClaims(transcription.text, "voice");
  const evidenceCards = await generateEvidenceCards(claims, "voice");

  return { transcription, claims, evidenceCards };
}

export async function runScreenshotVerificationPipeline(
  file: File,
): Promise<VerificationPipelineResult> {
  const ocr = await extractTextFromScreenshot(file);
  const claims = await extractClaims(ocr.text, "screenshot");
  const evidenceCards = await generateEvidenceCards(claims, "screenshot");

  return { ocr, claims, evidenceCards };
}

export async function verifyCall(
  scenario: "verified" | "suspicious" = "suspicious",
): Promise<CallVerificationResult> {
  await delay(2200);
  return mockCallVerificationResults[scenario];
}
