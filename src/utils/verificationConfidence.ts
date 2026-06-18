import { TRUSTED_SOURCES } from "../data/trustedSources";
import type {
  EvidenceCard,
  RegionalIntelligence,
  SourceCategory,
  SourceReference,
  TrustedSource,
  VerificationOutcome,
} from "../types";

const AUTHORITY_WEIGHTS: Record<SourceCategory, number> = {
  Government: 1.0,
  Health: 0.95,
  "Public Safety": 0.9,
  Education: 0.85,
  Transportation: 0.8,
  "Community Services": 0.75,
};

const REFUTE_PATTERNS = [
  /no official/,
  /not found/,
  /no proof/,
  /did not find/,
  /does not confirm/,
  /do not treat/,
  /contradict/,
  /false/,
  /remains open/,
  /no closure/,
  /not confirm/,
  /unverified/,
  /no evidence/,
  /not support/,
  /do not support/,
];

const SUPPORT_PATTERNS = [
  /confirmed/,
  /official notice/,
  /advisory issued/,
  /consistent with/,
  /supports this/,
  /verified by/,
  /officially closed/,
  /has been closed/,
  /boil-water advisory/,
  /emergency alert/,
];

export const VERIFICATION_CONFIDENCE_EXPLANATION =
  "Confidence reflects how strongly trusted sources support this verification outcome.";

export type ConfidenceTier = "high" | "medium" | "low";

export type VerificationConfidenceResult = {
  score: number;
  outcome: VerificationOutcome;
  outcomeLabel: string;
  headline: string;
  evidenceStatement: string;
  summary: string;
  tier: ConfidenceTier;
  explanation: string;
};

export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function getOutcomeLabel(outcome: VerificationOutcome): string {
  switch (outcome) {
    case "verified":
      return "VERIFIED";
    case "not_verified":
      return "NOT VERIFIED";
    case "inconclusive":
      return "INCONCLUSIVE";
  }
}

export function getConfidenceTierLabel(tier: ConfidenceTier): string {
  switch (tier) {
    case "high":
      return "High Confidence";
    case "medium":
      return "Moderate Confidence";
    case "low":
      return "Low Confidence";
  }
}

export function getOutcomeHeadline(
  score: number,
  outcome: VerificationOutcome,
): string {
  switch (outcome) {
    case "verified":
      return `${score}% confidence trusted sources support this claim`;
    case "not_verified":
      return `${score}% confidence trusted sources do not support this claim`;
    case "inconclusive":
      return `${score}% confidence`;
  }
}

export function getOutcomeEvidenceStatement(outcome: VerificationOutcome): string {
  switch (outcome) {
    case "verified":
      return "Evidence from trusted sources is consistent with the statement.";
    case "not_verified":
      return "Evidence from trusted sources contradicts the statement.";
    case "inconclusive":
      return "Sources provide conflicting information.";
  }
}

export function getOutcomeSummary(
  outcome: VerificationOutcome,
  sourceCount: number,
): string {
  if (sourceCount === 0) {
    return "No trusted sources were cross-referenced for this claim.";
  }

  switch (outcome) {
    case "verified":
      return "Trusted government and community sources align with this claim.";
    case "not_verified":
      return "Trusted sources checked do not corroborate this claim.";
    case "inconclusive":
      return "Trusted sources checked provide mixed or incomplete signals.";
  }
}

export function getOutcomeAccentText(
  outcome: VerificationOutcome,
  variant: "dark" | "light",
): string {
  switch (outcome) {
    case "verified":
      return variant === "dark" ? "text-emerald-400" : "text-emerald-700";
    case "not_verified":
      return variant === "dark" ? "text-red-400" : "text-red-700";
    case "inconclusive":
      return variant === "dark" ? "text-amber-400" : "text-amber-700";
  }
}

export function getOutcomeBarColor(outcome: VerificationOutcome): string {
  switch (outcome) {
    case "verified":
      return "bg-emerald-500";
    case "not_verified":
      return "bg-red-500";
    case "inconclusive":
      return "bg-amber-500";
  }
}

export function getOutcomeShieldClasses(
  outcome: VerificationOutcome,
  variant: "dark" | "light",
  size: "sm" | "lg" = "sm",
): string {
  const dimensions = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const base = `flex shrink-0 items-center justify-center rounded-full ${dimensions}`;
  switch (outcome) {
    case "verified":
      return `${base} ${variant === "dark" ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`;
    case "not_verified":
      return `${base} ${variant === "dark" ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-600"}`;
    case "inconclusive":
      return `${base} ${variant === "dark" ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-600"}`;
  }
}

export function getOutcomeBadgeClasses(
  outcome: VerificationOutcome,
  variant: "dark" | "light",
): string {
  const base =
    "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide";
  switch (outcome) {
    case "verified":
      return `${base} ${variant === "dark" ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"}`;
    case "not_verified":
      return `${base} ${variant === "dark" ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-800"}`;
    case "inconclusive":
      return `${base} ${variant === "dark" ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"}`;
  }
}

/** @deprecated Use getOutcomeAccentText with outcome instead */
export function getConfidenceAccentText(
  tier: ConfidenceTier,
  variant: "dark" | "light",
): string {
  switch (tier) {
    case "high":
      return variant === "dark" ? "text-emerald-400" : "text-emerald-700";
    case "medium":
      return variant === "dark" ? "text-amber-400" : "text-amber-700";
    case "low":
      return variant === "dark" ? "text-red-400" : "text-red-700";
  }
}

/** @deprecated Use getOutcomeBarColor with outcome instead */
export function getConfidenceBarColor(tier: ConfidenceTier): string {
  switch (tier) {
    case "high":
      return "bg-emerald-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-red-500";
  }
}

/** @deprecated Use getOutcomeShieldClasses with outcome instead */
export function getConfidenceShieldClasses(
  tier: ConfidenceTier,
  variant: "dark" | "light",
  size: "sm" | "lg" = "sm",
): string {
  return getOutcomeShieldClasses(
    tier === "high" ? "verified" : tier === "medium" ? "inconclusive" : "not_verified",
    variant,
    size,
  );
}

export function getConfidenceBadgeClasses(
  tier: ConfidenceTier,
  variant: "dark" | "light",
): string {
  const base =
    "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums";
  switch (tier) {
    case "high":
      return `${base} ${variant === "dark" ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"}`;
    case "medium":
      return `${base} ${variant === "dark" ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"}`;
    case "low":
      return `${base} ${variant === "dark" ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-800"}`;
  }
}

/** @deprecated Use getOutcomeHeadline instead */
export function getConfidenceHeadline(_score: number, tier: ConfidenceTier): string {
  return tier === "high"
    ? "High confidence in verification outcome"
    : tier === "medium"
      ? "Moderate confidence in verification outcome"
      : "Low confidence in verification outcome";
}

/** @deprecated Use getOutcomeEvidenceStatement instead */
export function getConfidenceResultDescription(
  summary: string,
  _tier: ConfidenceTier,
): string {
  return summary;
}

function resolveTrustedSource(
  ref: SourceReference,
  recommended: TrustedSource[],
): TrustedSource | undefined {
  return (
    recommended.find((s) => s.url === ref.url || s.name === ref.title) ??
    TRUSTED_SOURCES.find((s) => s.url === ref.url || s.name === ref.title)
  );
}

function freshnessScore(dateStr: string): number {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return 0.7;
  const days = (Date.now() - parsed) / (1000 * 60 * 60 * 24);
  if (days <= 1) return 1;
  if (days <= 7) return 0.9;
  if (days <= 30) return 0.75;
  if (days <= 90) return 0.55;
  return 0.35;
}

function sourceCountScore(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 10;
  if (count === 2) return 16;
  if (count === 3) return 21;
  return 23;
}

function sourceAgreementScore(
  count: number,
  categories: Set<SourceCategory>,
): number {
  const uniqueCategories = categories.size;
  if (count >= 3 && uniqueCategories >= 2) return 22;
  if (count >= 2 && uniqueCategories >= 2) return 19;
  if (count >= 2) return 14;
  if (count === 1) return 8;
  return 0;
}

function collectEvidenceText(card: EvidenceCard): string {
  return [
    card.summary,
    card.plainLanguageSummary,
    card.recommendation,
    ...(card.sourceReferences?.map((ref) => ref.snippet) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => (pattern.test(text) ? count + 1 : count), 0);
}

export function inferVerificationOutcome(card: EvidenceCard): VerificationOutcome {
  if (card.verificationOutcome) return card.verificationOutcome;

  const text = collectEvidenceText(card);
  const refuteScore = countPatternMatches(text, REFUTE_PATTERNS);
  const supportScore = countPatternMatches(text, SUPPORT_PATTERNS);

  if (refuteScore >= 2 && refuteScore > supportScore) return "not_verified";
  if (supportScore >= 2 && supportScore > refuteScore) return "verified";
  if (refuteScore >= 1 && supportScore >= 1) return "inconclusive";

  if (card.status === "verified") return "verified";
  if (card.status === "unverified") return "not_verified";
  if (card.status === "disputed") return "inconclusive";

  if (refuteScore > 0) return "not_verified";
  if (supportScore > 0) return "verified";
  return "inconclusive";
}

function computeSourceCoverageScore(input: {
  sourceReferences?: SourceReference[];
  regionalIntelligence?: RegionalIntelligence;
  sources?: string[];
}): { score: number; sourceCount: number; categories: Set<SourceCategory> } {
  const refs = input.sourceReferences ?? [];
  const recommended = input.regionalIntelligence?.recommendedSources ?? [];
  const sourceCount = Math.max(
    refs.length,
    recommended.length,
    input.sources?.length ?? 0,
  );

  const resolvedSources: TrustedSource[] = [];
  const categories = new Set<SourceCategory>();

  for (const ref of refs) {
    const match = resolveTrustedSource(ref, recommended);
    if (match) {
      resolvedSources.push(match);
      categories.add(match.category);
    }
  }

  for (const src of recommended) {
    if (!resolvedSources.some((r) => r.id === src.id)) {
      resolvedSources.push(src);
      categories.add(src.category);
    }
  }

  let authoritySum = 0;
  let authorityCount = 0;
  for (const src of resolvedSources) {
    authoritySum += AUTHORITY_WEIGHTS[src.category] ?? 0.7;
    authorityCount++;
  }
  if (authorityCount === 0 && sourceCount > 0) {
    authoritySum = sourceCount * 0.78;
    authorityCount = sourceCount;
  }

  const authorityComponent =
    authorityCount > 0 ? (authoritySum / authorityCount) * 32 : 4;

  let freshnessComponent = 12;
  if (refs.length > 0) {
    const averageFreshness =
      refs.reduce((sum, ref) => sum + freshnessScore(ref.date), 0) / refs.length;
    freshnessComponent = averageFreshness * 15;
  }

  const raw =
    sourceCountScore(sourceCount) +
    authorityComponent +
    sourceAgreementScore(sourceCount, categories) +
    freshnessComponent;

  return {
    score: Math.round(Math.min(100, Math.max(0, raw))),
    sourceCount,
    categories,
  };
}

function adjustOutcomeConfidence(
  coverageScore: number,
  outcome: VerificationOutcome,
  card: EvidenceCard,
): number {
  const text = collectEvidenceText(card);
  const refuteScore = countPatternMatches(text, REFUTE_PATTERNS);
  const supportScore = countPatternMatches(text, SUPPORT_PATTERNS);
  const signalStrength = Math.max(refuteScore, supportScore, 1);

  let clarityBoost = 0;
  switch (outcome) {
    case "verified":
      clarityBoost = supportScore * 4;
      break;
    case "not_verified":
      clarityBoost = refuteScore * 4;
      break;
    case "inconclusive":
      clarityBoost = Math.min(refuteScore, supportScore) * 2;
      break;
  }

  let score = Math.round(coverageScore * 0.75 + clarityBoost * 3 + signalStrength * 2);

  if (outcome === "inconclusive") {
    score = Math.min(score, 79);
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function calculateVerificationConfidence(
  input: EvidenceCard,
): VerificationConfidenceResult {
  const outcome = inferVerificationOutcome(input);
  const { score: coverageScore, sourceCount } = computeSourceCoverageScore(input);

  const score =
    input.verificationConfidence ??
    adjustOutcomeConfidence(coverageScore, outcome, input);

  const tier = getConfidenceTier(score);
  const summary =
    input.verificationConfidenceSummary ??
    getOutcomeSummary(outcome, sourceCount);

  return {
    score,
    outcome,
    outcomeLabel: getOutcomeLabel(outcome),
    headline: getOutcomeHeadline(score, outcome),
    evidenceStatement: getOutcomeEvidenceStatement(outcome),
    summary,
    tier,
    explanation: VERIFICATION_CONFIDENCE_EXPLANATION,
  };
}

export function resolveVerificationConfidence(
  card: EvidenceCard,
): VerificationConfidenceResult {
  return calculateVerificationConfidence(card);
}
