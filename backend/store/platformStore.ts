import { randomUUID } from "node:crypto";

export type PublishStatus = "approved" | "hold" | "blocked";

export type PlatformPolicy = {
  blockRefutedHighConfidence: boolean;
  holdInconclusive: boolean;
  holdUrgentReview: boolean;
  maxAutoApprovePerHour: number;
};

export type PlatformReview = {
  id: string;
  platformId: string;
  platformName: string;
  contentType: "post" | "comment" | "message" | "article";
  text: string;
  url?: string;
  authorId?: string;
  publishStatus: PublishStatus;
  reason: string;
  outcome: "verified" | "not_verified" | "inconclusive";
  confidenceBand: "low" | "medium" | "high";
  factChecks: Array<{ publisher: string; rating: string; url: string }>;
  policyViolations: string[];
  actionSummary: string;
  cardUrl: string;
  mapClaimId: string;
  reviewedAt: string;
  overridden?: boolean;
  overrideNote?: string;
};

const DEFAULT_POLICY: PlatformPolicy = {
  blockRefutedHighConfidence: true,
  holdInconclusive: true,
  holdUrgentReview: true,
  maxAutoApprovePerHour: 100,
};

let policy: PlatformPolicy = { ...DEFAULT_POLICY };
const reviews: PlatformReview[] = [];

export function getPlatformPolicy(): PlatformPolicy {
  return { ...policy };
}

export function updatePlatformPolicy(patch: Partial<PlatformPolicy>): PlatformPolicy {
  policy = { ...policy, ...patch };
  return getPlatformPolicy();
}

export function getPlatformReviews(limit = 50): PlatformReview[] {
  return [...reviews]
    .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())
    .slice(0, limit);
}

export function getPlatformReviewById(id: string): PlatformReview | undefined {
  return reviews.find((r) => r.id === id);
}

export function addPlatformReview(
  input: Omit<PlatformReview, "id" | "reviewedAt" | "overridden">,
): PlatformReview {
  const review: PlatformReview = {
    ...input,
    id: `pr-${randomUUID()}`,
    reviewedAt: new Date().toISOString(),
  };
  reviews.unshift(review);
  return review;
}

export function overridePlatformReview(
  id: string,
  publishStatus: PublishStatus,
  note?: string,
): PlatformReview | undefined {
  const review = reviews.find((r) => r.id === id);
  if (!review) return undefined;
  review.publishStatus = publishStatus;
  review.overridden = true;
  review.overrideNote = note;
  return review;
}

export function decidePublishStatus(input: {
  outcome: "verified" | "not_verified" | "inconclusive";
  confidenceBand: "low" | "medium" | "high";
  urgentReview: boolean;
}): { status: PublishStatus; violations: string[]; reason: string } {
  const violations: string[] = [];
  const p = policy;

  if (
    p.blockRefutedHighConfidence &&
    input.outcome === "not_verified" &&
    input.confidenceBand === "high"
  ) {
    violations.push("refuted_high_confidence");
    return {
      status: "blocked",
      violations,
      reason:
        "Claim is refuted or misleading with high confidence — block publication until corrected.",
    };
  }

  if (p.holdInconclusive && input.outcome === "inconclusive") {
    violations.push("inconclusive");
    return {
      status: "hold",
      violations,
      reason: "Verification inconclusive — route to human moderator before publishing.",
    };
  }

  if (p.holdUrgentReview && input.urgentReview) {
    violations.push("urgent_review");
    return {
      status: "hold",
      violations,
      reason: "High-impact claim needs human review before it goes live.",
    };
  }

  if (input.outcome === "not_verified" && input.confidenceBand !== "low") {
    violations.push("refuted_medium_confidence");
    return {
      status: "hold",
      violations,
      reason: "Claim may be misleading — hold for moderator decision.",
    };
  }

  return {
    status: "approved",
    violations,
    reason: "No policy violations detected — cleared for publication.",
  };
}

export function getPlatformStats() {
  const recent = reviews.filter(
    (r) => Date.now() - new Date(r.reviewedAt).getTime() < 24 * 60 * 60 * 1000,
  );
  return {
    totalReviews: reviews.length,
    last24h: recent.length,
    approved: recent.filter((r) => r.publishStatus === "approved").length,
    hold: recent.filter((r) => r.publishStatus === "hold").length,
    blocked: recent.filter((r) => r.publishStatus === "blocked").length,
    policy: getPlatformPolicy(),
  };
}
