import { randomUUID } from "node:crypto";
import { OFFICIAL_FEED_PINS, type OfficialFeedPin } from "../data/officialFeeds.js";
import { resolveClaimLocation } from "../services/claimGeolocation.js";
import { exportClaimsSnapshot, loadPersistedClaims, persistClaims } from "./mapPersistence.js";

export type ClaimSource = "voice" | "screenshot" | "call" | "community" | "deepfake" | "context-trace";

export type VerificationStatus =
  | "verified"
  | "unverified"
  | "disputed"
  | "pending";

export type AnalysisOutcome = "verified" | "not_verified" | "inconclusive";

export type SourceReference = {
  title: string;
  url: string;
  date: string;
  snippet: string;
};

export type Claim = {
  id: string;
  text: string;
  source: ClaimSource;
  /** Community / validator decision — never set from AI alone */
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
  /** AI pipeline suggestion — distinct from community status */
  analysisOutcome?: AnalysisOutcome;
  analysisConfidence?: number;
  sourceReferences?: SourceReference[];
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  narrativeDriftScore?: number;
  artifactLabel?: string;
  validatorNotes?: string;
  escalated?: boolean;
  auditTrail?: Array<{
    at: string;
    action: string;
    validatorId?: string;
    note?: string;
  }>;
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
  geohash: string;
  topCategories: string[];
};

const GEO_PRECISION = 0.025;

const seedClaims: Claim[] = [
  {
    id: "cm-seed-1",
    text: "Food bank on Memorial Drive permanently closed — do not visit.",
    source: "voice",
    status: "pending",
    confidence: 0.41,
    extractedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Memorial Drive food bank closed", ["Atlanta"], "cm-seed-1"),
    urgentReview: true,
    category: "Food Banks",
    analysisOutcome: "not_verified",
    analysisConfidence: 0.41,
  },
  {
    id: "cm-seed-2",
    text: "Boil water advisory issued for downtown Atlanta.",
    source: "screenshot",
    status: "pending",
    confidence: 0.55,
    extractedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("downtown Atlanta boil water", ["Atlanta"], "cm-seed-2"),
    urgentReview: true,
    category: "Public Health",
    analysisOutcome: "inconclusive",
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
    validatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    analysisOutcome: "verified",
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
    analysisOutcome: "not_verified",
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
    analysisOutcome: "not_verified",
    validatorNotes: "Contradicts official MARTA service alert.",
    validatorId: "validator-ngo-01",
    auditTrail: [
      {
        at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: "disputed",
        validatorId: "validator-ngo-01",
        note: "Contradicts official MARTA service alert.",
      },
    ],
  },
  {
    id: "cm-seed-6",
    text: "Social worker calling families asking for bank details — scam alert.",
    source: "call",
    status: "pending",
    confidence: 0.48,
    extractedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Fulton County social services", ["Fulton County"], "cm-seed-6"),
    urgentReview: true,
    category: "General",
    analysisOutcome: "inconclusive",
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
    validatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    analysisOutcome: "verified",
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
    analysisOutcome: "inconclusive",
  },
  {
    id: "cm-seed-9",
    text: "AI-generated flood photo shared as live Atlanta water crisis footage.",
    source: "deepfake",
    status: "pending",
    confidence: 0.71,
    extractedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    location: resolveClaimLocation("Atlanta water infrastructure", ["Atlanta"], "cm-seed-9"),
    urgentReview: true,
    category: "Emergency Alerts",
    artifactLabel: "Synthetic media",
    analysisOutcome: "not_verified",
  },
];

let claims: Claim[] = loadPersistedClaims(seedClaims);

type MapEventListener = (event: { type: string; claimId?: string }) => void;
const listeners = new Set<MapEventListener>();

function emitMapEvent(event: { type: string; claimId?: string }) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeMapEvents(listener: MapEventListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function save() {
  persistClaims(claims);
}

function geohashKey(lat: number, lng: number): string {
  const latBucket = Math.floor(lat / GEO_PRECISION);
  const lngBucket = Math.floor(lng / GEO_PRECISION);
  return `${latBucket}:${lngBucket}`;
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function confusionIntensity(claim: Claim): number {
  if (claim.status === "verified") return 0;
  const recency = Math.max(0, 1 - hoursSince(claim.extractedAt) / 48);
  const urgent = claim.urgentReview ? 0.25 : 0;
  const conf = 1 - claim.confidence;
  return Math.min(1, recency * 0.5 + urgent + conf * 0.25);
}

function computeHotspots(): MapHotspot[] {
  const buckets = new Map<
    string,
    MapHotspot & { categories: Map<string, number> }
  >();

  for (const claim of claims) {
    const loc = claim.location ?? resolveClaimLocation(claim.text, [], claim.id);
    const hash = geohashKey(loc.lat, loc.lng);
    const existing = buckets.get(hash) ?? {
      id: `hs-${hash}`,
      label: loc.label,
      lat: loc.lat,
      lng: loc.lng,
      intensity: 0,
      claimCount: 0,
      verifiedCount: 0,
      unverifiedCount: 0,
      geohash: hash,
      topCategories: [],
      categories: new Map<string, number>(),
    };

    existing.claimCount += 1;
    if (claim.status === "verified") existing.verifiedCount += 1;
    else existing.unverifiedCount += 1;

    if (claim.category) {
      existing.categories.set(
        claim.category,
        (existing.categories.get(claim.category) ?? 0) + 1,
      );
    }

    existing.intensity = Math.min(
      1,
      existing.unverifiedCount / Math.max(existing.claimCount, 1) +
        claims
          .filter((c) => {
            const cLoc = c.location ?? resolveClaimLocation(c.text, [], c.id);
            return geohashKey(cLoc.lat, cLoc.lng) === hash && c.status !== "verified";
          })
          .reduce((sum, c) => sum + confusionIntensity(c), 0) / 3,
    );

    buckets.set(hash, existing);
  }

  return Array.from(buckets.values())
    .map(({ categories, ...hotspot }) => ({
      ...hotspot,
      topCategories: [...categories.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    }))
    .sort((a, b) => b.unverifiedCount - a.unverifiedCount);
}

export function getClaims(filters?: {
  sinceHours?: number;
  category?: string;
}): Claim[] {
  let result = [...claims];
  if (filters?.sinceHours) {
    const cutoff = Date.now() - filters.sinceHours * 60 * 60 * 1000;
    result = result.filter((c) => new Date(c.extractedAt).getTime() >= cutoff);
  }
  if (filters?.category) {
    result = result.filter((c) => c.category === filters.category);
  }
  return result.sort(
    (a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime(),
  );
}

export function getClaimById(id: string): Claim | undefined {
  return claims.find((c) => c.id === id);
}

export function getHotspots(): MapHotspot[] {
  return computeHotspots();
}

export function getOfficialFeeds(): OfficialFeedPin[] {
  return OFFICIAL_FEED_PINS;
}

export function getCategoryStats(sinceHours = 168): Array<{ category: string; count: number }> {
  const cutoff = Date.now() - sinceHours * 60 * 60 * 1000;
  const counts = new Map<string, number>();
  for (const claim of claims) {
    if (new Date(claim.extractedAt).getTime() < cutoff) continue;
    const cat = claim.category ?? "General";
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getNearbyClaims(lat: number, lng: number, radiusKm = 8, limit = 5): Claim[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const haversine = (a: Claim) => {
    if (!a.location) return Infinity;
    const R = 6371;
    const dLat = toRad(a.location.lat - lat);
    const dLng = toRad(a.location.lng - lng);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(a.location.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  return claims
    .filter((c) => c.status !== "verified" && c.location)
    .map((c) => ({ c, dist: haversine(c) }))
    .filter(({ dist }) => dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(({ c }) => c);
}

export function isAwaitingValidation(claim: Claim): boolean {
  return claim.status !== "verified" && !claim.provenanceBadge;
}

export function getValidatorQueue(): Claim[] {
  return getClaims()
    .filter(isAwaitingValidation)
    .sort((a, b) => {
      if (Boolean(a.escalated) !== Boolean(b.escalated)) return a.escalated ? -1 : 1;
      if (Boolean(a.urgentReview) !== Boolean(b.urgentReview)) {
        return a.urgentReview ? -1 : 1;
      }
      return new Date(a.extractedAt).getTime() - new Date(b.extractedAt).getTime();
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
  analysisOutcome?: AnalysisOutcome;
  analysisConfidence?: number;
  sourceReferences?: SourceReference[];
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  narrativeDriftScore?: number;
  artifactLabel?: string;
};

export function addClaim(input: ReportClaimInput): Claim {
  const location =
    input.location ??
    resolveClaimLocation(input.text, input.locationHints ?? [], `cm-${Date.now()}`);

  const communityStatus: VerificationStatus =
    input.status === "verified" && input.source === "community"
      ? "verified"
      : "pending";

  const claim: Claim = {
    id: `cm-${randomUUID()}`,
    text: input.text,
    source: input.source ?? "community",
    status: communityStatus,
    confidence: input.confidence ?? 0.5,
    extractedAt: new Date().toISOString(),
    location,
    urgentReview:
      input.urgentReview ??
      ((input.confidence !== undefined && input.confidence < 0.65) || communityStatus === "pending"),
    category: input.category,
    analysisOutcome: input.analysisOutcome,
    analysisConfidence: input.analysisConfidence ?? input.confidence,
    sourceReferences: input.sourceReferences,
    primaryActionLabel: input.primaryActionLabel,
    primaryActionUrl: input.primaryActionUrl,
    narrativeDriftScore: input.narrativeDriftScore,
    artifactLabel: input.artifactLabel,
    auditTrail: [],
  };

  claims = [claim, ...claims];
  save();
  emitMapEvent({ type: "claim_added", claimId: claim.id });
  return claim;
}

function appendAudit(
  claim: Claim,
  action: string,
  validatorId?: string,
  note?: string,
): Claim {
  return {
    ...claim,
    auditTrail: [
      ...(claim.auditTrail ?? []),
      { at: new Date().toISOString(), action, validatorId, note },
    ],
  };
}

export function validateClaim(
  claimId: string,
  validatorId: string,
  badge: string,
  notes?: string,
): Claim | null {
  const idx = claims.findIndex((c) => c.id === claimId);
  if (idx === -1) return null;

  claims[idx] = appendAudit(
    {
      ...claims[idx],
      status: "verified",
      provenanceBadge: badge,
      validatorId,
      urgentReview: false,
      escalated: false,
      validatedAt: new Date().toISOString(),
      validatorNotes: notes ?? claims[idx].validatorNotes,
    },
    "verified",
    validatorId,
    notes,
  );
  save();
  emitMapEvent({ type: "claim_validated", claimId });
  return claims[idx];
}

export function disputeClaim(
  claimId: string,
  validatorId: string,
  notes?: string,
): Claim | null {
  const idx = claims.findIndex((c) => c.id === claimId);
  if (idx === -1) return null;

  claims[idx] = appendAudit(
    {
      ...claims[idx],
      status: "disputed",
      validatorId,
      validatorNotes: notes,
      urgentReview: false,
    },
    "disputed",
    validatorId,
    notes,
  );
  save();
  emitMapEvent({ type: "claim_disputed", claimId });
  return claims[idx];
}

export function escalateClaim(
  claimId: string,
  validatorId: string,
  notes?: string,
): Claim | null {
  const idx = claims.findIndex((c) => c.id === claimId);
  if (idx === -1) return null;

  claims[idx] = appendAudit(
    {
      ...claims[idx],
      escalated: true,
      urgentReview: true,
      validatorId,
      validatorNotes: notes,
    },
    "escalated",
    validatorId,
    notes,
  );
  save();
  emitMapEvent({ type: "claim_escalated", claimId });
  return claims[idx];
}

export function exportMapData(): string {
  return exportClaimsSnapshot(claims);
}

export function getHotspotClaims(geohash: string): Claim[] {
  return claims.filter((c) => {
    const loc = c.location ?? resolveClaimLocation(c.text, [], c.id);
    return geohashKey(loc.lat, loc.lng) === geohash;
  });
}
