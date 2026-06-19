export type NarrativeDriftBand = "low" | "moderate" | "high";

export type ManipulationRiskLevel = "Low" | "Medium" | "High";

export type ContextTraceVerdictLabel =
  | "Authentic"
  | "Reused Media"
  | "Out of Context"
  | "Misleading";

export type TimelineRole = "earliest" | "intermediate" | "current";

export type ExifMetadata = {
  found: boolean;
  captured?: string;
  published?: string;
  device?: string;
  gps?: string;
  software?: string;
};

export type TimelineAppearance = {
  id: string;
  role: TimelineRole;
  date: string;
  year: number;
  source: string;
  sourceUrl: string;
  contextSummary: string;
  imageUrl?: string;
};

export type NarrativeContext = {
  title: string;
  summary: string;
  date: string;
  source: string;
};

export type ContextTraceVerdict = {
  label: ContextTraceVerdictLabel;
  summary: string;
  explanation: string;
  confidence: number;
  manipulationRisk: ManipulationRiskLevel;
  statuses: string[];
};

export type ContextTraceAnalysis = {
  previewDataUrl: string;
  fileName: string;
  imageDescription: string;
  exif: ExifMetadata;
  timeline: TimelineAppearance[];
  originalContext: NarrativeContext;
  currentClaim: NarrativeContext;
  narrativeDriftScore: number;
  narrativeDriftBand: NarrativeDriftBand;
  narrativeDriftLabel: string;
  verdict: ContextTraceVerdict;
  demoMode?: boolean;
  demoReason?: string;
};
