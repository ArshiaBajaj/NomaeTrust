const TRUST_WORDS = [
  "RIVER", "MAPLE", "BRIDGE", "HARBOR", "MEADOW", "SUNFLOWER", "CANYON",
  "SPARROW", "OAK", "PINE", "CEDAR", "BLOOM", "HAVEN", "SUMMIT", "CREEK",
  "WILLOW", "STONE", "CLOUD", "EMBER", "FROST", "GLEN", "MIST", "CORAL",
  "DAWN", "DUSK", "FLINT", "GROVE", "IVORY", "JADE", "KITE", "LUNA",
];

export const TRUST_WORD_WINDOW_MS = 60_000;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRotatingTrustWords(familySecret: string, now = Date.now()): string[] {
  const slot = Math.floor(now / TRUST_WORD_WINDOW_MS);
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

export function getCurrentTrustPhrase(familySecret: string, now = Date.now()): string {
  return formatTrustWords(getRotatingTrustWords(familySecret, now));
}

export function verifyTrustWords(
  input: string,
  familySecret: string,
  now = Date.now(),
): boolean {
  const normalized = input.trim().toUpperCase().replace(/\s+/g, " ");
  const expected = getCurrentTrustPhrase(familySecret, now);
  return normalized === expected;
}

export function getSecondsUntilRotation(now = Date.now()): number {
  const elapsed = now % TRUST_WORD_WINDOW_MS;
  return Math.ceil((TRUST_WORD_WINDOW_MS - elapsed) / 1000);
}
