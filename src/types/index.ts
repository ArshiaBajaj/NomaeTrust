export type VerificationStatus =
  | "verified"
  | "unverified"
  | "disputed"
  | "pending";

export type ClaimSource = "voice" | "screenshot" | "call" | "community";

export type RiskLevel = "low" | "medium" | "high";

export type ConfidenceBand = "low" | "medium" | "high";

export type SourceCategory =
  | "Education"
  | "Health"
  | "Public Safety"
  | "Government"
  | "Community Services"
  | "Transportation";

export type ClaimCategory =
  | "Schools"
  | "Food Banks"
  | "Public Health"
  | "Transportation"
  | "Emergency Alerts"
  | "General";

export type TrustedSource = {
  id: string;
  name: string;
  category: SourceCategory;
  claimCategories: ClaimCategory[];
  locations: string[];
  url: string;
  description: string;
};

export type RegionalIntelligence = {
  locations: string[];
  claimCategory: ClaimCategory;
  sourceCategory: SourceCategory;
  recommendedSources: TrustedSource[];
};

export type SourceReference = {
  title: string;
  url: string;
  date: string;
  snippet: string;
};

export type EvidenceTranslations = {
  somali: string;
  spanish: string;
};

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
  urgentReview?: boolean;
  provenanceBadge?: string;
  validatorId?: string;
};

export type EvidenceCard = {
  id: string;
  claim: string;
  status: VerificationStatus;
  statusLabel?: string;
  confidence: number;
  confidenceBand?: ConfidenceBand;
  sources: string[];
  sourceReferences?: SourceReference[];
  summary: string;
  plainLanguageSummary?: string;
  valuesBridge?: string;
  recommendation?: string;
  actionSteps?: string[];
  doNotDo?: string[];
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  translations?: EvidenceTranslations;
  verifiedAt: string;
  riskLevel: RiskLevel;
  sourceType: ClaimSource;
  demoMode?: boolean;
  demoReason?: string;
  regionalIntelligence?: RegionalIntelligence;
  urgentReview?: boolean;
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
  challengeCode?: string;
};

export type CallVerificationResult = {
  callerName: string;
  isVerified: boolean;
  deepfakeRiskScore: number;
  voicePassport: VoicePassport | null;
  analysis: string;
  recommendation: string;
  challengeCode: string;
  challengePassed: boolean | null;
  detectedClaim: string | null;
  transcript: string;
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

export type ComposedEvidencePayload = {
  summary: string;
  plainLanguageSummary: string;
  valuesBridge: string;
  confidenceBand: ConfidenceBand;
  recommendation: string;
  actionSteps: string[];
  doNotDo: string[];
  primaryActionLabel: string;
  primaryActionUrl: string;
  sourceReferences: SourceReference[];
  translations: EvidenceTranslations;
  urgentReview: boolean;
  riskLevel: RiskLevel;
};

export type AudioAnalysisResult = {
  transcript: string;
  claim: string;
  confidence: number;
  status: string;
  demoMode?: boolean;
  demoReason?: string;
  regionalIntelligence?: RegionalIntelligence;
  evidenceCard?: ComposedEvidencePayload;
};

export type ImageAnalysisResult = AudioAnalysisResult & {
  ocr: OCRResult;
};

export type VerificationPipelineResult = {
  transcription?: TranscriptionResult;
  ocr?: OCRResult;
  claims: Claim[];
  evidenceCards: EvidenceCard[];
};
