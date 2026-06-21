import type { AudioAnalysisResult } from "../types";
import { analyzeRegionalIntelligence } from "./regionalIntelligence";

import { API_BASE } from "../config/api";

export const DEMO_ANALYSIS_RESULT: AudioAnalysisResult = {
  transcript:
    "The local food bank has permanently closed and residents should stop visiting the center.",
  claim: "The local food bank has permanently closed.",
  confidence: 0.87,
  status: "Needs Verification",
  demoMode: true,
};

function enrichResult(result: AudioAnalysisResult): AudioAnalysisResult {
  const regionalIntelligence =
    result.regionalIntelligence ??
    analyzeRegionalIntelligence(result.transcript, result.claim);
  return { ...result, regionalIntelligence };
}

export async function analyzeAudio(file: File): Promise<AudioAnalysisResult> {
  const formData = new FormData();
  formData.append("audio", file);

  try {
    const response = await fetch(`${API_BASE}/api/analyze-audio`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as
      | AudioAnalysisResult
      | { error?: string }
      | null;

    if (response.ok && data && "transcript" in data) {
      return enrichResult(data);
    }

    return enrichResult(DEMO_ANALYSIS_RESULT);
  } catch {
    return enrichResult(DEMO_ANALYSIS_RESULT);
  }
}
