const TRUST_WORDS = [
  "RIVER", "MAPLE", "BRIDGE", "HARBOR", "MEADOW", "SUNFLOWER", "CANYON",
  "SPARROW", "OAK", "PINE", "CEDAR", "BLOOM", "HAVEN", "SUMMIT", "CREEK",
  "WILLOW", "STONE", "CLOUD", "EMBER", "FROST", "GLEN", "MIST", "CORAL",
  "DAWN", "DUSK", "FLINT", "GROVE", "IVORY", "JADE", "KITE", "LUNA",
];

const SECRET_KEY = "nomae-trust-circle-secret";
const WINDOW_MS = 60_000;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getOrCreateFamilySecret(): string {
  try {
    const existing = localStorage.getItem(SECRET_KEY);
    if (existing) return existing;
    const secret = `nt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SECRET_KEY, secret);
    return secret;
  } catch {
    return "nomae-demo-family-secret";
  }
}

export function setFamilySecret(secret: string): void {
  localStorage.setItem(SECRET_KEY, secret.trim());
}

export function getRotatingTrustWords(secret?: string): string[] {
  const familySecret = secret ?? getOrCreateFamilySecret();
  const slot = Math.floor(Date.now() / WINDOW_MS);
  const seed = hashString(`${familySecret}:${slot}`);
  const words: string[] = [];
  for (let i = 0; i < 4; i++) {
    words.push(TRUST_WORDS[(seed + i * 7) % TRUST_WORDS.length]);
  }
  return words;
}

export function formatTrustWords(words: string[]): string {
  return words.join(" ");
}

export function verifyTrustWords(input: string, secret?: string): boolean {
  const normalized = input.trim().toUpperCase().replace(/\s+/g, " ");
  const expected = formatTrustWords(getRotatingTrustWords(secret));
  return normalized === expected;
}

export function getTrustCirclePairingCode(): string {
  return getOrCreateFamilySecret();
}

export function getSecondsUntilRotation(): number {
  const elapsed = Date.now() % WINDOW_MS;
  return Math.ceil((WINDOW_MS - elapsed) / 1000);
}
