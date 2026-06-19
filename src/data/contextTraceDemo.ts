import type { ContextTraceAnalysis } from "../types/contextTrace";

export const CONTEXT_TRACE_DEMO: ContextTraceAnalysis = {
  previewDataUrl: "",
  fileName: "chennai-flood-repost.jpg",
  imageDescription:
    "Aerial or street-level photograph of people wading through floodwater in an urban area, consistent with monsoon flooding coverage rather than a water contamination laboratory scene.",
  exif: {
    found: false,
    captured: "Stripped on re-upload",
    published: "Unknown — viral chain",
    device: "Screenshot re-upload",
    gps: "Not embedded in file",
  },
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
  demoMode: true,
};
