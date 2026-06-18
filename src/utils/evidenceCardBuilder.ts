import type {
  AudioAnalysisResult,
  ClaimSource,
  ComposedEvidencePayload,
  EvidenceCard,
  RiskLevel,
  VerificationStatus,
} from "../types";
import { calculateVerificationConfidence } from "./verificationConfidence";

function toVerificationStatus(status: string): VerificationStatus {
  if (
    status === "verified" ||
    status === "unverified" ||
    status === "disputed" ||
    status === "pending"
  ) {
    return status;
  }
  return "pending";
}

function bandToRisk(band?: string, confidence?: number): RiskLevel {
  if (band === "low") return "low";
  if (band === "medium") return "medium";
  if (band === "high") return "high";
  if ((confidence ?? 0) >= 0.75) return "low";
  if ((confidence ?? 0) >= 0.45) return "medium";
  return "high";
}

export function buildEvidenceCardFromAnalysis(
  result: AudioAnalysisResult,
  sourceType: ClaimSource,
): EvidenceCard {
  const isDemo = result.demoMode === true;
  const payload = result.evidenceCard;
  const statusLabel = isDemo ? "Needs Verification" : result.status;

  const sourceRefs = payload?.sourceReferences ?? [];
  const sources =
    sourceRefs.length > 0
      ? sourceRefs.map((s) => s.title)
      : isDemo
        ? ["Demo Mode", "Regional Intelligence DB"]
        : ["OpenAI Whisper", "GPT-4o-mini", "Regional Intelligence DB"];

  const baseCard: EvidenceCard = {
    id: `NT-${Date.now().toString(36).toUpperCase()}`,
    claim: result.claim,
    status: isDemo ? "pending" : toVerificationStatus(result.status),
    statusLabel,
    confidence: result.confidence,
    confidenceBand: payload?.confidenceBand,
    sources,
    sourceReferences: sourceRefs,
    summary:
      payload?.summary ??
      (isDemo
        ? "Voice note analysis indicates a potentially false community service closure claim."
        : `Primary factual claim extracted. Status: ${statusLabel}.`),
    plainLanguageSummary: payload?.plainLanguageSummary,
    valuesBridge: payload?.valuesBridge,
    recommendation: payload?.recommendation,
    actionSteps: payload?.actionSteps,
    doNotDo: payload?.doNotDo,
    primaryActionLabel: payload?.primaryActionLabel,
    primaryActionUrl: payload?.primaryActionUrl,
    translations: payload?.translations,
    verifiedAt: new Date().toISOString(),
    riskLevel: payload?.riskLevel ?? bandToRisk(payload?.confidenceBand, result.confidence),
    sourceType,
    demoMode: isDemo,
    demoReason: result.demoReason,
    regionalIntelligence: result.regionalIntelligence,
    urgentReview: payload?.urgentReview,
    verificationOutcome: payload?.verificationOutcome,
  };

  const verification = calculateVerificationConfidence({
    ...baseCard,
    verificationConfidence: payload?.verificationOutcomeConfidence,
  });

  return {
    ...baseCard,
    verificationOutcome: payload?.verificationOutcome ?? verification.outcome,
    verificationConfidence: payload?.verificationOutcomeConfidence ?? verification.score,
    verificationConfidenceSummary: verification.summary,
  };
}

export function composedPayloadFromCard(
  card: EvidenceCard,
): ComposedEvidencePayload | undefined {
  if (!card.sourceReferences?.length) return undefined;
  return {
    summary: card.summary,
    plainLanguageSummary: card.plainLanguageSummary ?? card.summary,
    valuesBridge: card.valuesBridge ?? "",
    confidenceBand: card.confidenceBand ?? "medium",
    recommendation: card.recommendation ?? "",
    actionSteps: card.actionSteps ?? [],
    doNotDo: card.doNotDo ?? [],
    primaryActionLabel: card.primaryActionLabel ?? "Open official source",
    primaryActionUrl: card.primaryActionUrl ?? "",
    sourceReferences: card.sourceReferences,
    translations: card.translations ?? { somali: "", spanish: "" },
    urgentReview: card.urgentReview ?? false,
    riskLevel: card.riskLevel,
    verificationOutcome: card.verificationOutcome,
    verificationOutcomeConfidence: card.verificationConfidence,
  };
}
