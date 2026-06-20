import type {
  CategoryStat,
  Claim,
  ClaimSource,
  MapHotspot,
  OfficialFeedPin,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

type ClaimFilters = {
  sinceHours?: number;
  category?: string;
};

export async function getMapHotspots(): Promise<MapHotspot[]> {
  const res = await fetch(`${API_BASE}/api/map/hotspots`);
  if (!res.ok) throw new Error("Failed to load hotspots");
  return res.json();
}

export async function getHotspotClaims(geohash: string): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/map/hotspots/${encodeURIComponent(geohash)}/claims`);
  if (!res.ok) throw new Error("Failed to load hotspot claims");
  return res.json();
}

export async function getCommunityClaims(filters?: ClaimFilters): Promise<Claim[]> {
  const params = new URLSearchParams();
  if (filters?.sinceHours) params.set("sinceHours", String(filters.sinceHours));
  if (filters?.category) params.set("category", filters.category);
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/map/claims${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to load claims");
  return res.json();
}

export async function getClaimById(id: string): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/map/claims/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Claim not found");
  }
  return res.json() as Promise<Claim>;
}

export async function getValidatorQueue(): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/map/validator-queue`);
  if (!res.ok) throw new Error("Failed to load validator queue");
  return res.json();
}

export async function getCategoryStats(sinceHours = 168): Promise<CategoryStat[]> {
  const res = await fetch(`${API_BASE}/api/map/categories?sinceHours=${sinceHours}`);
  if (!res.ok) throw new Error("Failed to load category stats");
  return res.json();
}

export async function getOfficialFeeds(): Promise<OfficialFeedPin[]> {
  const res = await fetch(`${API_BASE}/api/map/official-feeds`);
  if (!res.ok) throw new Error("Failed to load official feeds");
  return res.json();
}

export async function getNearbyClaims(
  lat: number,
  lng: number,
  radiusKm = 8,
  limit = 5,
): Promise<Claim[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/api/map/nearby?${params}`);
  if (!res.ok) throw new Error("Failed to load nearby claims");
  return res.json();
}

export function subscribeMapStream(onEvent: () => void): () => void {
  const source = new EventSource(`${API_BASE}/api/map/stream`);
  source.onmessage = () => onEvent();
  source.onerror = () => {
    source.close();
  };
  return () => source.close();
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
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to report claim");
  }
  return res.json();
}

export async function validateClaimApi(
  claimId: string,
  validatorId: string,
  badge: string,
  notes?: string,
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/map/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimId, validatorId, badge, notes }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Validation failed");
  }
  return res.json();
}

export async function disputeClaimApi(
  claimId: string,
  validatorId: string,
  notes?: string,
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/map/dispute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimId, validatorId, notes }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Dispute failed");
  }
  return res.json();
}

export async function escalateClaimApi(
  claimId: string,
  validatorId: string,
  notes?: string,
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/map/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimId, validatorId, notes }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Escalation failed");
  }
  return res.json();
}

export async function reportDetectiveCatch(
  clipLabel: string,
  artifactLabel?: string,
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/detective/report-catch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clipLabel, artifactLabel }),
  });
  if (!res.ok) throw new Error("Failed to report deepfake catch");
  const data = (await res.json()) as { claim: Claim };
  return data.claim;
}

export function actionCardUrlForClaim(claim: Pick<Claim, "id" | "source" | "text">): string {
  if (claim.source === "news") {
    const params = new URLSearchParams({
      headline: claim.text,
      share: "1",
      from: "web",
    });
    return `/news-watch?${params.toString()}`;
  }
  if (claim.source === "screenshot") {
    return `/screenshot?mapClaimId=${encodeURIComponent(claim.id)}`;
  }
  if (claim.source === "context-trace") {
    return `/call?mapClaimId=${encodeURIComponent(claim.id)}`;
  }
  return `/stress?mapClaimId=${encodeURIComponent(claim.id)}`;
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
