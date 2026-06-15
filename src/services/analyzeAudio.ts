import type { AudioAnalysisResult } from "../types";

export class AnalyzeAudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyzeAudioError";
  }
}

export async function analyzeAudio(file: File): Promise<AudioAnalysisResult> {
  const formData = new FormData();
  formData.append("audio", file);

  let response: Response;
  try {
    response = await fetch("/api/analyze-audio", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new AnalyzeAudioError(
      "Could not reach the analysis server. Make sure the backend is running.",
    );
  }

  const data = (await response.json().catch(() => null)) as
    | AudioAnalysisResult
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data && data.error
        ? data.error
        : `Analysis failed (${response.status})`;
    throw new AnalyzeAudioError(message);
  }

  if (!data || !("transcript" in data)) {
    throw new AnalyzeAudioError("Invalid response from analysis server");
  }

  return data;
}
