export type GeoPoint = {
  lat: number;
  lng: number;
  label: string;
};

const BASE_COORDS: Record<string, GeoPoint> = {
  Atlanta: { lat: 33.749, lng: -84.388, label: "Atlanta, GA" },
  "Downtown Atlanta": { lat: 33.755, lng: -84.39, label: "Downtown Atlanta" },
  "East Atlanta": { lat: 33.74, lng: -84.345, label: "East Atlanta" },
  "West Atlanta": { lat: 33.735, lng: -84.455, label: "West Atlanta" },
  "Memorial Drive": { lat: 33.739, lng: -84.352, label: "Memorial Drive" },
  "Fulton County": { lat: 33.79, lng: -84.47, label: "Fulton County" },
  Georgia: { lat: 33.749, lng: -84.388, label: "Georgia" },
  Decatur: { lat: 33.775, lng: -84.296, label: "Decatur, GA" },
  Buckhead: { lat: 33.839, lng: -84.379, label: "Buckhead" },
  Midtown: { lat: 33.781, lng: -84.388, label: "Midtown Atlanta" },
};

const TEXT_PATTERNS: { pattern: RegExp; key: keyof typeof BASE_COORDS }[] = [
  { pattern: /\bmemorial drive\b/i, key: "Memorial Drive" },
  { pattern: /\bdowntown\b/i, key: "Downtown Atlanta" },
  { pattern: /\beast atlanta\b/i, key: "East Atlanta" },
  { pattern: /\bwest atlanta\b/i, key: "West Atlanta" },
  { pattern: /\bbuckhead\b/i, key: "Buckhead" },
  { pattern: /\bmidtown\b/i, key: "Midtown" },
  { pattern: /\bdecatur\b/i, key: "Decatur" },
  { pattern: /\bfulton county\b/i, key: "Fulton County" },
  { pattern: /\batlanta\b/i, key: "Atlanta" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Small deterministic offset (~150–400 m) so pins don't stack on identical coords. */
function privacyJitter(lat: number, lng: number, seed: string): GeoPoint {
  const h = hashString(seed);
  const latOffset = ((h % 1000) / 1000 - 0.5) * 0.006;
  const lngOffset = (((h >> 10) % 1000) / 1000 - 0.5) * 0.006;
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
    label: "",
  };
}

export function resolveClaimLocation(
  text: string,
  locations: string[] = [],
  seed = "claim",
): GeoPoint {
  for (const { pattern, key } of TEXT_PATTERNS) {
    if (pattern.test(text)) {
      const base = BASE_COORDS[key];
      const jittered = privacyJitter(base.lat, base.lng, seed);
      return { ...jittered, label: base.label };
    }
  }

  for (const name of locations) {
    const base = BASE_COORDS[name as keyof typeof BASE_COORDS];
    if (base) {
      const jittered = privacyJitter(base.lat, base.lng, seed);
      return { ...jittered, label: base.label };
    }
  }

  const fallback = BASE_COORDS.Atlanta;
  const jittered = privacyJitter(fallback.lat, fallback.lng, seed);
  return { ...jittered, label: fallback.label };
}
