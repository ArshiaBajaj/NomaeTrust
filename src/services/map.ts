import type { Claim, ClaimSource } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function getMapHotspots() {
  const res = await fetch(`${API_BASE}/api/map/hotspots`);
  if (!res.ok) throw new Error("Failed to load hotspots");
  return res.json();
}

export async function getCommunityClaims(): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/map/claims`);
  if (!res.ok) throw new Error("Failed to load claims");
  return res.json();
}

export async function getValidatorQueue(): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/map/validator-queue`);
  if (!res.ok) throw new Error("Failed to load validator queue");
  return res.json();
}

export async function reportClaim(
  claimText: string,
  options?: {
    source?: ClaimSource;
    confidence?: number;
    urgentReview?: boolean;
  },
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/map/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: claimText,
      source: options?.source ?? "community",
      confidence: options?.confidence,
      urgentReview: options?.urgentReview,
    }),
  });
  if (!res.ok) throw new Error("Failed to report claim");
  return res.json();
}

export async function validateClaimApi(
  claimId: string,
  validatorId: string,
  badge: string,
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/map/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimId, validatorId, badge }),
  });
  if (!res.ok) throw new Error("Validation failed");
  return res.json();
}

export async function syncClaimToMap(
  text: string,
  source: ClaimSource,
  confidence: number,
  urgentReview?: boolean,
): Promise<Claim | null> {
  try {
    return await reportClaim(text, { source, confidence, urgentReview });
  } catch {
    return null;
  }
}
