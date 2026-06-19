import { randomUUID } from "node:crypto";
import { resolveClaimLocation } from "../services/claimGeolocation.js";

export type ClaimSource = "voice" | "screenshot" | "call" | "community" | "deepfake";

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
  category?: string;
  validatedAt?: string;
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

const seedClaims: Claim[] = [
  {
    id: "cm-seed-1",
    text: "Food bank on Memorial Drive permanently closed — do not visit.",
    source: "voice",
    status: "pending",
    confidence: 0.41,
    extractedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation(
      "Memorial Drive food bank closed",
      ["Atlanta"],
      "cm-seed-1",
    ),
    urgentReview: true,
    category: "Food Banks",
  },
  {
    id: "cm-seed-2",
    text: "Boil water advisory issued for downtown Atlanta.",
    source: "screenshot",
    status: "unverified",
    confidence: 0.55,
    extractedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("downtown Atlanta boil water", ["Atlanta"], "cm-seed-2"),
    urgentReview: true,
    category: "Public Health",
  },
  {
    id: "cm-seed-3",
    text: "Free vaccine clinic at East Atlanta community center this weekend.",
    source: "community",
    status: "verified",
    confidence: 0.91,
    extractedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("East Atlanta community center", ["Atlanta"], "cm-seed-3"),
    provenanceBadge: "United Way Validator",
    validatorId: "validator-uw-01",
    category: "Public Health",
  },
  {
    id: "cm-seed-4",
    text: "Atlanta Public Schools closed tomorrow due to power outage rumor.",
    source: "voice",
    status: "pending",
    confidence: 0.38,
    extractedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Atlanta Public Schools", ["Atlanta"], "cm-seed-4"),
    urgentReview: true,
    category: "Schools",
  },
  {
    id: "cm-seed-5",
    text: "MARTA shutting down all lines tonight — screenshot circulating.",
    source: "screenshot",
    status: "disputed",
    confidence: 0.62,
    extractedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("MARTA Atlanta transit", ["Atlanta"], "cm-seed-5"),
    category: "Transportation",
  },
  {
    id: "cm-seed-6",
    text: "Social worker calling families asking for bank details — scam alert.",
    source: "call",
    status: "unverified",
    confidence: 0.48,
    extractedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Fulton County social services", ["Fulton County"], "cm-seed-6"),
    urgentReview: true,
    category: "General",
  },
  {
    id: "cm-seed-7",
    text: "Buckhead shelter at capacity — beds available only until 8pm.",
    source: "community",
    status: "verified",
    confidence: 0.84,
    extractedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Buckhead shelter", ["Atlanta"], "cm-seed-7"),
    provenanceBadge: "NGO Provenance Badge",
    validatorId: "validator-ngo-01",
    category: "Community Services",
  },
  {
    id: "cm-seed-8",
    text: "Decatur food pantry hours extended through Sunday.",
    source: "voice",
    status: "pending",
    confidence: 0.52,
    extractedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Decatur food pantry", ["Decatur"], "cm-seed-8"),
    category: "Food Banks",
  },
  {
    id: "cm-seed-9",
    text: "AI-generated flood photo shared as live Atlanta water crisis footage.",
    source: "deepfake",
    status: "unverified",
    confidence: 0.71,
    extractedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Atlanta water infrastructure", ["Atlanta"], "cm-seed-9"),
    urgentReview: true,
    category: "Emergency Alerts",
  },
];

let claims: Claim[] = [...seedClaims];

function computeHotspots(): MapHotspot[] {
  const buckets = new Map<string, MapHotspot>();

  for (const claim of claims) {
    const loc = claim.location ?? resolveClaimLocation(claim.text, [], claim.id);
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

export function isAwaitingValidation(claim: Claim): boolean {
  return claim.status !== "verified" && !claim.provenanceBadge;
}

export function getValidatorQueue(): Claim[] {
  return getClaims()
    .filter(isAwaitingValidation)
    .sort((a, b) => {
      if (Boolean(a.urgentReview) !== Boolean(b.urgentReview)) {
        return a.urgentReview ? -1 : 1;
      }
      return (
        new Date(a.extractedAt).getTime() - new Date(b.extractedAt).getTime()
      );
    });
}

export type ReportClaimInput = {
  text: string;
  source?: ClaimSource;
  confidence?: number;
  status?: VerificationStatus;
  location?: Claim["location"];
  urgentReview?: boolean;
  category?: string;
  locationHints?: string[];
};

export function addClaim(input: ReportClaimInput): Claim {
  const location =
    input.location ??
    resolveClaimLocation(
      input.text,
      input.locationHints ?? [],
      `cm-${Date.now()}`,
    );

  const claim: Claim = {
    id: `cm-${randomUUID()}`,
    text: input.text,
    source: input.source ?? "community",
    status: input.status ?? "pending",
    confidence: input.confidence ?? 0.5,
    extractedAt: new Date().toISOString(),
    location,
    urgentReview:
      input.urgentReview ??
      (input.status === "pending" ||
        input.status === "unverified" ||
        input.status === "disputed" ||
        (input.confidence !== undefined && input.confidence < 0.65)),
    category: input.category,
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
    validatedAt: new Date().toISOString(),
  };
  return claims[idx];
}
