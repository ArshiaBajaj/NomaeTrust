export type VerificationStatus =
  | "verified"
  | "unverified"
  | "disputed"
  | "pending";

export type ClaimSource = "voice" | "screenshot" | "call" | "community";

export type RiskLevel = "low" | "medium" | "high";

export type Claim = {
  id: string;
  text: string;
  source: ClaimSource;
  status: VerificationStatus;
  confidence: number;
  extractedAt: string;
  location?: {
    lat: number;
    lng: number;
    label: string;
  };
};

export type EvidenceCard = {
  id: string;
  claim: string;
  status: VerificationStatus;
  confidence: number;
  sources: string[];
  summary: string;
  verifiedAt: string;
  riskLevel: RiskLevel;
  sourceType: ClaimSource;
};

export type TranscriptionResult = {
  text: string;
  duration: number;
  language: string;
  confidence: number;
};

export type OCRResult = {
  text: string;
  confidence: number;
  regions: number;
};

export type VoicePassport = {
  contactName: string;
  voiceprintId: string;
  enrolledAt: string;
  trustScore: number;
};

export type CallVerificationResult = {
  callerName: string;
  isVerified: boolean;
  deepfakeRiskScore: number;
  voicePassport: VoicePassport | null;
  analysis: string;
  recommendation: string;
};

export type MapHotspot = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  intensity: number;
  claimCount: number;
  verifiedCount: number;
  unverifiedCount: number;
};

export type PipelineStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
};

export type AudioAnalysisResult = {
  transcript: string;
  claim: string;
  confidence: number;
  status: string;
};

export type VerificationPipelineResult = {
  transcription?: TranscriptionResult;
  ocr?: OCRResult;
  claims: Claim[];
  evidenceCards: EvidenceCard[];
};
