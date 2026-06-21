import type { ImageAnalysisResult } from "../types";
import { DEMO_ANALYSIS_RESULT } from "./analyzeAudio";

import { API_BASE } from "../config/api";

const DEMO_OCR = {
  text: `BREAKING: City water supply contaminated with bacteria.
Residents advised to boil all water immediately.
Officials confirm outbreak in downtown Atlanta district.`,
  confidence: 0.85,
  regions: 3,
};

export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/api/analyze-image`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as
      | ImageAnalysisResult
      | { error?: string }
      | null;

    if (response.ok && data && "transcript" in data && "ocr" in data) {
      return data;
    }

    return {
      ...DEMO_ANALYSIS_RESULT,
      claim: "City water supply is contaminated with bacteria in downtown Atlanta.",
      ocr: DEMO_OCR,
    };
  } catch {
    return {
      ...DEMO_ANALYSIS_RESULT,
      claim: "City water supply is contaminated with bacteria in downtown Atlanta.",
      ocr: DEMO_OCR,
    };
  }
}
