export type PublishStatus = "approved" | "hold" | "blocked";

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

export type PlatformStats = {
  totalReviews: number;
  last24h: number;
  approved: number;
  hold: number;
  blocked: number;
  policy: {
    blockRefutedHighConfidence: boolean;
    holdInconclusive: boolean;
    holdUrgentReview: boolean;
    maxAutoApprovePerHour: number;
  };
};

import { API_BASE } from "../config/api";

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = import.meta.env.VITE_EXTENSION_API_KEY;
  if (key) headers["X-NomaeTrust-Key"] = key;
  return headers;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_BASE}/api/platform/stats`);
  if (!res.ok) throw new Error("Failed to load platform stats.");
  return res.json() as Promise<PlatformStats>;
}

export async function fetchPlatformReviews(): Promise<PlatformReview[]> {
  const res = await fetch(`${API_BASE}/api/platform/reviews`);
  if (!res.ok) throw new Error("Failed to load review queue.");
  const data = (await res.json()) as { reviews: PlatformReview[] };
  return data.reviews;
}

export async function submitPlatformContent(input: {
  platformId: string;
  platformName: string;
  contentType: PlatformReview["contentType"];
  text: string;
  url?: string;
}): Promise<PlatformReview> {
  const res = await fetch(`${API_BASE}/api/platform/submit`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Submit failed.");
  }
  return res.json() as Promise<PlatformReview>;
}

export async function overridePlatformReview(
  id: string,
  publishStatus: PublishStatus,
  note?: string,
): Promise<PlatformReview> {
  const res = await fetch(`${API_BASE}/api/platform/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publishStatus, note }),
  });
  if (!res.ok) throw new Error("Override failed.");
  return res.json() as Promise<PlatformReview>;
}
