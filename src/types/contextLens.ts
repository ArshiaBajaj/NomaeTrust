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

export type ProvenanceMetadata = {
  gps: string;
  captured: string;
  published: string;
  device?: string;
};

export type ProvenanceEvent = {
  year: number;
  label: string;
  headline: string;
  source: string;
  thumbnailVariant?: "flood" | "protest";
  imageUrl?: string;
  metadata: ProvenanceMetadata;
};

export type MetadataDiscrepancy = {
  field: string;
  original: string;
  current: string;
};

export type WebMatch = {
  title: string;
  link: string;
  source?: string;
  date?: string;
};

export type ContextLensAnalysis = {
  imageUrl: string;
  resolvedUrl: string;
  previewDataUrl: string;
  exifFound: boolean;
  events: ProvenanceEvent[];
  metadataDiscrepancies: MetadataDiscrepancy[];
  narrativeDelta: string;
  shareSummary: string;
  timelineMinYear: number;
  timelineMaxYear: number;
  webMatches: WebMatch[];
  googleLensUrl: string;
  usedGoogleLens: boolean;
  reverseImageQuery?: string;
  reverseImageTotalResults?: number;
  serpApiConfigured?: boolean;
  deepfake?: DeepfakeAssessment;
  trackedReportId?: string | null;
  syncedToMap?: boolean;
  demoMode?: boolean;
  demoReason?: string;
};
