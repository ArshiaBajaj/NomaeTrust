import type {
  ContextTraceAnalysis,
  ContextTraceVerdictLabel,
  ManipulationRiskLevel,
  NarrativeDriftBand,
  TimelineAppearance,
} from "../../types/contextTrace.js";

export const DEMO_ANALYSIS: Omit<
  ContextTraceAnalysis,
  "previewDataUrl" | "fileName" | "exif"
> = {
  imageDescription:
    "Aerial or street-level photograph of people wading through floodwater in an urban area, consistent with monsoon flooding coverage rather than a water contamination laboratory scene.",
  timeline: [
    {
      id: "earliest",
      role: "earliest",
      date: "2015-12-02",
      year: 2015,
      source: "The Hindu",
      sourceUrl: "https://www.thehindu.com/news/cities/chennai/",
      contextSummary:
        "News photograph from Chennai flooding coverage — rescue workers wading through submerged streets during the December 2015 monsoon crisis.",
    },
    {
      id: "mid-2019",
      role: "intermediate",
      date: "2019-08-14",
      year: 2019,
      source: "Facebook community page",
      sourceUrl: "https://facebook.com/",
      contextSummary:
        "Recirculated as a generic “major city flooding” post without location tags — context partially removed.",
    },
    {
      id: "current",
      role: "current",
      date: "2026-06-10",
      year: 2026,
      source: "Viral WhatsApp forward",
      sourceUrl: "https://wa.me/",
      contextSummary:
        "Shared as “breaking” evidence of Atlanta water contamination and infrastructure collapse — location and event rewritten.",
    },
  ],
  originalContext: {
    title: "2015 Chennai flooding news report",
    summary:
      "2015 Chennai flooding news report showing rescue teams in submerged Tamil Nadu neighborhoods during the December 2015 monsoon disaster.",
    date: "December 2, 2015",
    source: "The Hindu — verified news archive",
  },
  currentClaim: {
    title: "2026 Atlanta water contamination",
    summary:
      "Claimed to show 2026 Atlanta water contamination and unsafe tap water — presented as current local evidence.",
    date: "June 10, 2026",
    source: "Viral WhatsApp chain — unverified",
  },
  narrativeDriftScore: 90,
  narrativeDriftBand: "high",
  narrativeDriftLabel: "High Context Manipulation Risk",
  verdict: {
    label: "Misleading",
    summary:
      "This image first appeared in a 2015 news article about flooding in Chennai. Current posts claiming it shows Atlanta water contamination in 2026 are misleading because the image predates the event by over a decade.",
    explanation:
      "The visual content depicts flood response activity, not water quality testing or contamination infrastructure. The narrative attached in recent shares does not match what the photograph documents.",
    confidence: 92,
    manipulationRisk: "High",
    statuses: ["Out of Context", "Misleading", "Likely Reused Media"],
  },
};

export function driftBandFromScore(score: number): NarrativeDriftBand {
  if (score >= 70) return "high";
  if (score >= 35) return "moderate";
  return "low";
}

export function driftLabelFromBand(band: NarrativeDriftBand): string {
  switch (band) {
    case "high":
      return "High Context Manipulation Risk";
    case "moderate":
      return "Moderate Context Drift";
    case "low":
      return "Low Context Drift";
  }
}

export function normalizeManipulationRisk(value: unknown): ManipulationRiskLevel {
  if (value === "Low" || value === "Medium" || value === "High") return value;
  const lower = String(value).toLowerCase();
  if (lower === "low") return "Low";
  if (lower === "high") return "High";
  return "Medium";
}

export function normalizeVerdictLabel(value: unknown): ContextTraceVerdictLabel {
  const labels: ContextTraceVerdictLabel[] = [
    "Authentic",
    "Reused Media",
    "Out of Context",
    "Misleading",
  ];
  if (labels.includes(value as ContextTraceVerdictLabel)) {
    return value as ContextTraceVerdictLabel;
  }
  const lower = String(value).toLowerCase();
  if (lower.includes("misleading")) return "Misleading";
  if (lower.includes("reused")) return "Reused Media";
  if (lower.includes("context")) return "Out of Context";
  return "Authentic";
}

export function statusesForVerdict(label: ContextTraceVerdictLabel): string[] {
  switch (label) {
    case "Authentic":
      return ["Authentic"];
    case "Reused Media":
      return ["Reused Media", "Likely Reused Media"];
    case "Out of Context":
      return ["Out of Context", "Likely Reused Media"];
    case "Misleading":
      return ["Misleading", "Out of Context", "Likely Reused Media"];
  }
}

export function attachPreviewToTimeline(
  timeline: TimelineAppearance[],
  previewDataUrl: string,
): TimelineAppearance[] {
  return timeline.map((entry, index) => ({
    ...entry,
    imageUrl: index === 0 ? previewDataUrl : entry.imageUrl,
  }));
}

export function buildDemoAnalysis(
  previewDataUrl: string,
  fileName: string,
  exif: ContextTraceAnalysis["exif"],
  demoReason: string,
): ContextTraceAnalysis {
  return {
    ...DEMO_ANALYSIS,
    previewDataUrl,
    fileName,
    exif,
    timeline: attachPreviewToTimeline(DEMO_ANALYSIS.timeline, previewDataUrl),
    demoMode: true,
    demoReason,
  };
}
