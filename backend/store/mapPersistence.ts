import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Claim } from "./mapStore.js";

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const DATA_FILE = path.join(DATA_DIR, "mapClaims.json");

export function loadPersistedClaims(fallback: Claim[]): Claim[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return fallback;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Claim[];
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function persistClaims(claims: Claim[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2));
}

export function exportClaimsSnapshot(claims: Claim[]): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), claims }, null, 2);
}
