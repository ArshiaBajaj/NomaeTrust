import type { ContextLensAnalysis } from "../types/contextLens";

export type {
  ContextLensAnalysis,
  MetadataDiscrepancy,
  ProvenanceEvent,
  ProvenanceMetadata,
} from "../types/contextLens";

export const CONTEXT_LENS_DEMO: ContextLensAnalysis = {
  imageUrl: "",
  resolvedUrl: "",
  previewDataUrl: "",
  exifFound: false,
  narrativeDelta:
    "This photo was first published in 2018. It was reused in 2026 with an incorrect location/date description to create a false narrative.",
  shareSummary:
    "ContextLens: This protest photo is actually a 2018 Reuters flood-response image reused with false context. Original: Kerala, India (Aug 2018). Current viral claim: Downtown Atlanta protest (Jun 2026).",
  timelineMinYear: 2018,
  timelineMaxYear: 2026,
  webMatches: [],
  googleLensUrl: "https://lens.google.com/",
  usedGoogleLens: false,
  demoMode: true,
  deepfake: {
    deepfakeRiskScore: 0.78,
    riskBand: "high",
    manipulationType: "compositing",
    confidence: 0.82,
    artifacts: [
      "Lighting on faces inconsistent with background",
      "Blur halo around jawline typical of face-swap edges",
      "EXIF stripped — common on re-uploaded viral images",
    ],
    analysis:
      "Visual indicators suggest this image was composited or re-contextualized. The scene elements do not align with the claimed protest narrative.",
    recommendation:
      "Do not forward as breaking news. Compare with Google Lens and check local official channels.",
    tracked: true,
  },
  syncedToMap: false,
  events: [
    {
      year: 2018,
      label: "The Truth: Original Context",
      headline: "Rescue teams reach flooded neighborhoods in Kerala",
      source: "Reuters — verified news article",
      thumbnailVariant: "flood",
      metadata: {
        gps: "Kerala, India (10.85°N, 76.27°E)",
        captured: "2018-08-14 09:22 IST",
        published: "2018-08-15 — Reuters",
        device: "Canon EOS 5D Mark IV",
      },
    },
    {
      year: 2026,
      label: "The Rumor: Mutated Narrative",
      headline: "BREAKING: Active protest downtown — police clash with crowds",
      source: "Viral tweet — unverified repost",
      thumbnailVariant: "protest",
      metadata: {
        gps: "Claimed: Downtown Atlanta (metadata stripped)",
        captured: "Unknown — EXIF removed",
        published: "2026-06-10 — Twitter/X",
        device: "Screenshot re-upload",
      },
    },
  ],
  metadataDiscrepancies: [
    {
      field: "GPS",
      original: "Kerala, India (10.85°N, 76.27°E)",
      current: '"Downtown Atlanta" (missing/stripped)',
    },
    {
      field: "Captured",
      original: "2018-08-14 09:22 IST",
      current: "Unknown / stripped",
    },
    {
      field: "Published",
      original: "2018-08-15 — Reuters",
      current: "2026-06-10 — Twitter/X",
    },
    {
      field: "Device",
      original: "Canon EOS 5D Mark IV",
      current: "Screenshot re-upload",
    },
  ],
};
