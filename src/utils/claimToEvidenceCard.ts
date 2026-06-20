import type { Claim, EvidenceCard } from "../types";

export function evidenceCardFromClaim(claim: Claim): EvidenceCard {
  const confidence = claim.analysisConfidence ?? claim.confidence;
  const band =
    confidence >= 0.75 ? "high" : confidence >= 0.5 ? "medium" : "low";

  return {
    id: `MAP-${claim.id}`,
    claim: claim.text,
    status: claim.status,
    statusLabel: "Confusion Map",
    confidence,
    confidenceBand: band,
    verificationOutcome: claim.analysisOutcome ?? "inconclusive",
    verificationConfidence: Math.round(confidence * 100),
    sources: (claim.sourceReferences ?? []).map((s) => s.title),
    sourceReferences: claim.sourceReferences ?? [],
    summary: claim.text,
    plainLanguageSummary: claim.text,
    recommendation:
      claim.primaryActionLabel ??
      "Review sources before sharing. Community validators may update this claim.",
    actionSteps: claim.primaryActionUrl
      ? [`Follow up: ${claim.primaryActionLabel ?? "official source"}`]
      : ["Check official sources before acting on this claim."],
    doNotDo: ["Do not forward without verifying with a trusted source."],
    primaryActionLabel: claim.primaryActionLabel,
    primaryActionUrl: claim.primaryActionUrl,
    verifiedAt: claim.validatedAt ?? claim.extractedAt,
    riskLevel: claim.urgentReview ? "high" : band === "high" ? "low" : "medium",
    sourceType: claim.source,
    urgentReview: claim.urgentReview,
  };
}
