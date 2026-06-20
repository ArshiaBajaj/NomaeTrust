import { runExtensionVerify } from "./extensionVerify.js";
import {
  addPlatformReview,
  decidePublishStatus,
  type PlatformReview,
} from "../store/platformStore.js";

export type PlatformSubmitInput = {
  platformId: string;
  platformName: string;
  contentType: "post" | "comment" | "message" | "article";
  text: string;
  url?: string;
  authorId?: string;
};

export async function reviewContentForPublish(
  input: PlatformSubmitInput,
): Promise<PlatformReview> {
  const platform =
    input.platformName.toLowerCase().includes("reddit")
      ? "reddit"
      : input.platformName.toLowerCase().includes("discord")
        ? "discord"
        : "web";

  const verify = await runExtensionVerify({
    text: input.text,
    url: input.url,
    platform,
  });

  const urgentReview =
    verify.outcome === "inconclusive" ||
    (verify.outcome === "not_verified" && verify.confidenceBand !== "low");

  const decision = decidePublishStatus({
    outcome: verify.outcome,
    confidenceBand: verify.confidenceBand,
    urgentReview,
  });

  const review = addPlatformReview({
    platformId: input.platformId,
    platformName: input.platformName,
    contentType: input.contentType,
    text: input.text,
    url: input.url,
    authorId: input.authorId,
    publishStatus: decision.status,
    reason: decision.reason,
    outcome: verify.outcome,
    confidenceBand: verify.confidenceBand,
    factChecks: verify.factChecks.map((fc) => ({
      publisher: fc.publisher,
      rating: fc.rating,
      url: fc.reviewUrl ?? fc.url,
    })),
    policyViolations: decision.violations,
    actionSummary: verify.actionSummary,
    cardUrl: verify.cardUrl,
    mapClaimId: verify.mapClaimId,
  });

  const frontendBase =
    process.env.FRONTEND_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5173";
  review.cardUrl = `${frontendBase}/platform?review=${review.id}`;
  return review;
}
