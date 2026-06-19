import {
  getOpenAIClient,
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "../openaiClient.js";
import type {
  ContextTraceAnalysis,
  ContextTraceVerdictLabel,
  TimelineAppearance,
  TimelineRole,
} from "../../types/contextTrace.js";
import {
  attachPreviewToTimeline,
  driftBandFromScore,
  driftLabelFromBand,
  normalizeManipulationRisk,
  normalizeVerdictLabel,
  statusesForVerdict,
} from "./demoAnalysis.js";

type GptContextPayload = {
  imageDescription?: string;
  likelyOriginalContext?: {
    title?: string;
    summary?: string;
    date?: string;
    source?: string;
  };
  currentClaimSummary?: {
    title?: string;
    summary?: string;
    date?: string;
    source?: string;
  };
  timeline?: Array<{
    id?: string;
    role?: string;
    date?: string;
    year?: number;
    source?: string;
    sourceUrl?: string;
    contextSummary?: string;
  }>;
  narrativeDriftScore?: number;
  manipulationRisk?: string;
  verdict?: string;
  explanation?: string;
  confidence?: number;
};

const RESPONSE_SCHEMA = `{
  "imageDescription": "2-3 sentences describing what is visibly in the photograph",
  "likelyOriginalContext": {
    "title": "short title for original documented context",
    "summary": "what the image likely originally documented",
    "date": "best estimate or 'Unknown'",
    "source": "likely original source type e.g. news agency, government, eyewitness"
  },
  "currentClaimSummary": {
    "title": "what a viral repost might falsely claim",
    "summary": "how this image is commonly misused or reframed today",
    "date": "recent timeframe or 'Unknown'",
    "source": "typical resharing channel e.g. WhatsApp, social media"
  },
  "timeline": [
    {
      "id": "earliest",
      "role": "earliest",
      "date": "YYYY-MM-DD or descriptive date",
      "year": number,
      "source": "source name",
      "sourceUrl": "https://example.com or plausible placeholder",
      "contextSummary": "original context in one sentence"
    },
    {
      "id": "intermediate",
      "role": "intermediate",
      "date": "...",
      "year": number,
      "source": "...",
      "sourceUrl": "...",
      "contextSummary": "optional intermediate reuse"
    },
    {
      "id": "current",
      "role": "current",
      "date": "...",
      "year": number,
      "source": "...",
      "sourceUrl": "...",
      "contextSummary": "current misleading narrative"
    }
  ],
  "narrativeDriftScore": number 0-100,
  "manipulationRisk": "Low" | "Medium" | "High",
  "verdict": "Authentic" | "Reused Media" | "Out of Context" | "Misleading",
  "explanation": "2-4 sentences explaining why the image may or may not be misleading",
  "confidence": number 0-100
}`;

function normalizeRole(role: string | undefined, index: number, total: number): TimelineRole {
  if (role === "earliest" || role === "intermediate" || role === "current") return role;
  if (index === 0) return "earliest";
  if (index === total - 1) return "current";
  return "intermediate";
}

function parseTimeline(raw: GptContextPayload["timeline"]): TimelineAppearance[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("GPT returned empty timeline");
  }

  return raw.slice(0, 4).map((entry, index, arr) => {
    const role = normalizeRole(entry.role, index, arr.length);
    const year =
      typeof entry.year === "number"
        ? entry.year
        : Number.parseInt(String(entry.date ?? "").slice(0, 4), 10) ||
          new Date().getFullYear();

    return {
      id: entry.id ?? `${role}-${index}`,
      role,
      date: entry.date ?? String(year),
      year,
      source: entry.source ?? "Unknown source",
      sourceUrl: entry.sourceUrl ?? "https://example.com",
      contextSummary: entry.contextSummary ?? "Context unavailable.",
    };
  });
}

function buildVerdictSummary(
  label: ContextTraceVerdictLabel,
  originalTitle: string,
  currentTitle: string,
): string {
  switch (label) {
    case "Authentic":
      return `Visual analysis suggests this image aligns with its stated context (${originalTitle}).`;
    case "Reused Media":
      return `This image appears to be reused media. It likely originated as "${originalTitle}" but is now circulating as "${currentTitle}".`;
    case "Out of Context":
      return `This image appears out of context. It likely documents "${originalTitle}" but is being shared as "${currentTitle}".`;
    case "Misleading":
      return `This image is likely misleading. It appears to document "${originalTitle}" while current shares claim "${currentTitle}".`;
  }
}

export async function analyzeContextTraceWithGpt(input: {
  imageDataUrl: string;
  fileName: string;
  exifSummary: string;
}): Promise<Omit<ContextTraceAnalysis, "previewDataUrl" | "fileName" | "exif">> {
  const prompt = `You are a misinformation analyst for NomaeTrust Context Trace.

Analyze this uploaded image for CONTEXT MANIPULATION — when an old or unrelated photo is reused to support a false modern claim.

Use visual evidence only. Infer plausible original vs viral narratives when reverse search is unavailable. Be cautious — use "likely", "appears", "consistent with" when uncertain.

EXIF/metadata from file:
${input.exifSummary}

File name: ${input.fileName}

Tasks:
1. Describe what is visibly in the image.
2. Infer the LIKELY original documented context (event, location, era).
3. Infer how such an image might be MISUSED in a current viral claim.
4. Build a 2-3 point timeline: earliest truth → optional intermediate reuse → current rumor narrative.
5. Score narrativeDriftScore 0-100 (how far current viral framing drifts from original context).
6. Set manipulationRisk: Low (<35 drift), Medium (35-69), High (70+).
7. Verdict: Authentic | Reused Media | Out of Context | Misleading
8. Explain clearly for a stressed family member why the image may be misleading.

Respond with ONLY valid JSON:
${RESPONSE_SCHEMA}`;

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1800,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: input.imageDataUrl, detail: "high" } },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty GPT-4o context trace response");

  const parsed = JSON.parse(raw) as GptContextPayload;

  const originalContext = {
    title: parsed.likelyOriginalContext?.title ?? "Likely original context",
    summary:
      parsed.likelyOriginalContext?.summary ??
      "Original documented context could not be determined.",
    date: parsed.likelyOriginalContext?.date ?? "Unknown",
    source: parsed.likelyOriginalContext?.source ?? "Unknown source",
  };

  const currentClaim = {
    title: parsed.currentClaimSummary?.title ?? "Current viral claim",
    summary:
      parsed.currentClaimSummary?.summary ??
      "How this image may be reframed in recent shares.",
    date: parsed.currentClaimSummary?.date ?? "Recent",
    source: parsed.currentClaimSummary?.source ?? "Social media / messaging apps",
  };

  const timeline = parseTimeline(parsed.timeline);
  const narrativeDriftScore = Math.round(
    Math.min(100, Math.max(0, Number(parsed.narrativeDriftScore) || 0)),
  );
  const narrativeDriftBand = driftBandFromScore(narrativeDriftScore);
  const verdictLabel = normalizeVerdictLabel(parsed.verdict);
  const manipulationRisk = normalizeManipulationRisk(parsed.manipulationRisk);
  const confidence = Math.round(
    Math.min(100, Math.max(0, Number(parsed.confidence) || narrativeDriftScore)),
  );
  const explanation =
    parsed.explanation?.trim() ||
    "Analysis could not produce a detailed explanation.";

  return {
    imageDescription:
      parsed.imageDescription?.trim() ||
      "Visual description unavailable from analysis.",
    timeline,
    originalContext,
    currentClaim,
    narrativeDriftScore,
    narrativeDriftBand,
    narrativeDriftLabel: driftLabelFromBand(narrativeDriftBand),
    verdict: {
      label: verdictLabel,
      summary: buildVerdictSummary(verdictLabel, originalContext.title, currentClaim.title),
      explanation,
      confidence,
      manipulationRisk,
      statuses: statusesForVerdict(verdictLabel),
    },
  };
}

export async function tryGptContextTraceAnalysis(input: {
  imageDataUrl: string;
  fileName: string;
  exifSummary: string;
}): Promise<Omit<ContextTraceAnalysis, "previewDataUrl" | "fileName" | "exif"> | null> {
  try {
    return await analyzeContextTraceWithGpt(input);
  } catch (error) {
    logOpenAIError("context trace GPT-4o", error);
    if (shouldFallbackToDemoMode(error)) return null;
    throw error;
  }
}

export { attachPreviewToTimeline };
