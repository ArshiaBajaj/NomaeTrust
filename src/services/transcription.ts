import {
  mockScreenshotOCR,
  mockVoiceTranscription,
} from "../data/mockClaims";
import type { OCRResult, TranscriptionResult } from "../types";

const MOCK_DELAY_MS = 1800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transcribeAudio(_file: File): Promise<TranscriptionResult> {
  await delay(MOCK_DELAY_MS);

  return {
    text: mockVoiceTranscription,
    duration: 18.4,
    language: "en-US",
    confidence: 0.94,
  };
}

export async function extractTextFromScreenshot(
  _file: File,
): Promise<OCRResult> {
  await delay(MOCK_DELAY_MS);

  return {
    text: mockScreenshotOCR,
    confidence: 0.91,
    regions: 4,
  };
}
