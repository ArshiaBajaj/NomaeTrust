import type { Claim } from "../types";

export function isAwaitingValidation(claim: Claim): boolean {
  return claim.status !== "verified" && !claim.provenanceBadge;
}

export const QUEUE_STATUS_LABEL: Record<
  Exclude<Claim["status"], "verified">,
  string
> = {
  pending: "Awaiting review",
  unverified: "Unverified",
  disputed: "Disputed",
};
