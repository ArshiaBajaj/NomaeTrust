import {
  getOpenAIClient,
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "../openaiClient.js";

export type ManipulationType =
  | "none"
  | "ai_generated"
  | "face_swap"
  | "compositing"
  | "metadata_mismatch"
  | "uncertain";

export type DeepfakeAssessment = {
  deepfakeRiskScore: number;
  riskBand: "low" | "medium" | "high";
  manipulationType: ManipulationType;
  confidence: number;
  artifacts: string[];
  analysis: string;
  recommendation: string;
  tracked: boolean;
};

type DetectionInput = {
  imageDataUrl: string;
  exifFound: boolean;
  hasProvenanceMismatch: boolean;
  narrativeDelta?: string;
};

const RESPONSE_SCHEMA = `{
  "deepfakeRiskScore": number between 0 and 1,
  "riskBand": "low" | "medium" | "high",
  "manipulationType": "none" | "ai_generated" | "face_swap" | "compositing" | "metadata_mismatch" | "uncertain",
  "confidence": number between 0 and 1,
  "artifacts": string[],
  "analysis": string,
  "recommendation": string
}`;

export async function analyzeDeepfakeRisk(
  input: DetectionInput,
): Promise<DeepfakeAssessment> {
  const context = [
    `EXIF embedded in file: ${input.exifFound ? "yes" : "no — often stripped on re-uploads"}`,
    `Provenance/context mismatch detected: ${input.hasProvenanceMismatch ? "yes" : "unknown"}`,
    input.narrativeDelta ? `Narrative delta: ${input.narrativeDelta}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are a forensic media analyst helping families detect synthetic or manipulated images (deepfakes, AI-generated photos, face swaps, composited scenes).

Analyze this image for manipulation signals. Look for:
- AI-generated textures (warped hands, inconsistent hair, glossy skin, nonsense text)
- Face-swap boundary artifacts, lighting mismatches, blur around jawline/ears
- Compositing (cutout edges, shadow direction conflicts, resolution mismatches)
- Signs the scene is staged or digitally altered for misleading news

Context:
${context}

Rules:
- deepfakeRiskScore: 0.0 = likely authentic photograph, 1.0 = highly likely manipulated/synthetic
- riskBand: low (<0.35), medium (0.35-0.64), high (>=0.65)
- List specific visual artifacts you observe (max 5 short bullets)
- Do NOT claim certainty — use "indicators suggest", "consistent with"
- recommendation: plain-language next step for a stressed family member

Respond with ONLY valid JSON:
${RESPONSE_SCHEMA}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: input.imageDataUrl, detail: "high" } },
          ],
        },
      ],
      max_tokens: 800,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty deepfake analysis");

    const parsed = JSON.parse(raw) as Omit<DeepfakeAssessment, "tracked">;
    const score = Math.min(1, Math.max(0, Number(parsed.deepfakeRiskScore) || 0));

    return {
      deepfakeRiskScore: score,
      riskBand:
        parsed.riskBand ??
        (score >= 0.65 ? "high" : score >= 0.35 ? "medium" : "low"),
      manipulationType: parsed.manipulationType ?? "uncertain",
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts.slice(0, 6) : [],
      analysis: parsed.analysis ?? "Visual analysis completed.",
      recommendation:
        parsed.recommendation ??
        "Verify through official sources before sharing or acting on urgent claims.",
      tracked: score >= 0.65,
    };
  } catch (error) {
    logOpenAIError("deepfake detection", error);
    if (shouldFallbackToDemoMode(error)) {
      return fallbackAssessment(input);
    }
    throw error;
  }
}

function fallbackAssessment(input: DetectionInput): DeepfakeAssessment {
  const elevated = !input.exifFound || input.hasProvenanceMismatch;
  const score = elevated ? 0.58 : 0.22;

  return {
    deepfakeRiskScore: score,
    riskBand: score >= 0.65 ? "high" : score >= 0.35 ? "medium" : "low",
    manipulationType: input.hasProvenanceMismatch ? "metadata_mismatch" : "uncertain",
    confidence: 0.4,
    artifacts: elevated
      ? ["EXIF/metadata missing or inconsistent with claimed context"]
      : ["Automated analysis unavailable — manual review recommended"],
    analysis:
      "Could not run full visual deepfake model. Metadata and provenance signals were used as a weak proxy.",
    recommendation:
      "Treat urgent claims from this image with caution. Check official sources and compare with Google Lens.",
    tracked: score >= 0.65,
  };
}

export function formatManipulationLabel(type: ManipulationType): string {
  const labels: Record<ManipulationType, string> = {
    none: "No manipulation indicators",
    ai_generated: "AI-generated image signals",
    face_swap: "Possible face swap",
    compositing: "Possible compositing",
    metadata_mismatch: "Metadata / context mismatch",
    uncertain: "Uncertain — needs review",
  };
  return labels[type];
}
