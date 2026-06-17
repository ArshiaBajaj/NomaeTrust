import type { AudioAnalysisResult } from "../types";
import { analyzeRegionalIntelligence } from "./regionalIntelligence";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const DEMO_ANALYSIS_RESULT: AudioAnalysisResult = {
  transcript:
    "The local food bank has permanently closed and residents should stop visiting the center.",
  claim: "The local food bank has permanently closed.",
  confidence: 0.87,
  status: "Needs Verification",
  demoMode: true,
};

function enrichResult(result: AudioAnalysisResult): AudioAnalysisResult {
  return {
    ...result,
    regionalIntelligence: analyzeRegionalIntelligence(
      result.transcript,
      result.claim,
    ),
  };
}

export async function analyzeAudio(file: File): Promise<AudioAnalysisResult> {
  const url = `${API_BASE}/api/analyze-audio`;

  console.log("[analyzeAudio] POST", url, {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  const formData = new FormData();
  formData.append("audio", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    console.log("[analyzeAudio] Response", response.status, response.statusText);

    const data = (await response.json().catch(() => null)) as
      | AudioAnalysisResult
      | { error?: string }
      | null;

    if (response.ok && data && "transcript" in data) {
      console.log("[analyzeAudio] Success", { demoMode: data.demoMode ?? false });
      return enrichResult(data);
    }

    console.warn("[analyzeAudio] Server error — using demo mode", data);
    return enrichResult(DEMO_ANALYSIS_RESULT);
  } catch (err) {
    const detail =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.warn("[analyzeAudio] Fetch failed — using demo mode:", detail);
    return enrichResult(DEMO_ANALYSIS_RESULT);
  }
}
