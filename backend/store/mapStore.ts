export type ClaimSource = "voice" | "screenshot" | "call" | "community";

export type VerificationStatus =
  | "verified"
  | "unverified"
  | "disputed"
  | "pending";

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

const ATLANTA = { lat: 33.749, lng: -84.388, label: "Atlanta, GA" };

const seedClaims: Claim[] = [
  {
    id: "cm-seed-1",
    text: "Food bank on Memorial Drive permanently closed — do not visit.",
    source: "voice",
    status: "pending",
    confidence: 0.41,
    extractedAt: "2026-06-16T02:14:00Z",
    location: ATLANTA,
    urgentReview: true,
  },
  {
    id: "cm-seed-2",
    text: "Boil water advisory issued for downtown Atlanta.",
    source: "screenshot",
    status: "unverified",
    confidence: 0.55,
    extractedAt: "2026-06-15T18:30:00Z",
    location: { lat: 33.755, lng: -84.39, label: "Downtown Atlanta" },
    urgentReview: true,
  },
  {
    id: "cm-seed-3",
    text: "Free vaccine clinic at community center this weekend — verified by NGO.",
    source: "community",
    status: "verified",
    confidence: 0.91,
    extractedAt: "2026-06-14T09:00:00Z",
    location: { lat: 33.77, lng: -84.35, label: "East Atlanta" },
    provenanceBadge: "United Way Validator",
    validatorId: "validator-uw-01",
  },
];

let claims: Claim[] = [...seedClaims];

function computeHotspots(): MapHotspot[] {
  const buckets = new Map<string, MapHotspot>();

  for (const claim of claims) {
    const loc = claim.location ?? ATLANTA;
    const key = loc.label;
    const existing = buckets.get(key) ?? {
      id: `hs-${key.replace(/\s+/g, "-").toLowerCase()}`,
      label: loc.label,
      lat: loc.lat,
      lng: loc.lng,
      intensity: 0,
      claimCount: 0,
      verifiedCount: 0,
      unverifiedCount: 0,
    };

    existing.claimCount += 1;
    if (claim.status === "verified") existing.verifiedCount += 1;
    else existing.unverifiedCount += 1;
    existing.intensity = Math.min(
      1,
      existing.unverifiedCount / Math.max(existing.claimCount, 1),
    );
    buckets.set(key, existing);
  }

  return Array.from(buckets.values()).sort(
    (a, b) => b.unverifiedCount - a.unverifiedCount,
  );
}

export function getClaims(): Claim[] {
  return [...claims].sort(
    (a, b) =>
      new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime(),
  );
}

export function getHotspots(): MapHotspot[] {
  return computeHotspots();
}

export function getValidatorQueue(): Claim[] {
  return getClaims().filter(
    (c) =>
      c.urgentReview === true &&
      c.status !== "verified" &&
      !c.provenanceBadge,
  );
}

export type ReportClaimInput = {
  text: string;
  source?: ClaimSource;
  confidence?: number;
  status?: VerificationStatus;
  location?: Claim["location"];
  urgentReview?: boolean;
};

export function addClaim(input: ReportClaimInput): Claim {
  const claim: Claim = {
    id: `cm-${Date.now()}`,
    text: input.text,
    source: input.source ?? "community",
    status: input.status ?? "pending",
    confidence: input.confidence ?? 0.5,
    extractedAt: new Date().toISOString(),
    location: input.location ?? {
      ...ATLANTA,
      label: "Atlanta, GA",
    },
    urgentReview:
      input.urgentReview ??
      (input.confidence !== undefined && input.confidence < 0.5),
  };
  claims = [claim, ...claims];
  return claim;
}

export function validateClaim(
  claimId: string,
  validatorId: string,
  badge: string,
): Claim | null {
  const idx = claims.findIndex((c) => c.id === claimId);
  if (idx === -1) return null;

  claims[idx] = {
    ...claims[idx],
    status: "verified",
    provenanceBadge: badge,
    validatorId,
    urgentReview: false,
  };
  return claims[idx];
}
