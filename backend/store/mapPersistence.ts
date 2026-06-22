import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Claim } from "./mapStore.js";

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const DATA_FILE = path.join(DATA_DIR, "mapClaims.json");
const RUNTIME_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Vercel/Lambda use a read-only filesystem — keep claims in memory only. */
function canPersistToDisk(): boolean {
  if (process.env.VERCEL) return false;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  if (process.env.LAMBDA_TASK_ROOT) return false;
  if (process.env.AWS_EXECUTION_ENV) return false;
  if (RUNTIME_DIR.includes("/var/task") || DATA_DIR.includes("/var/task")) return false;
  try {
    if (process.cwd().startsWith("/var/task")) return false;
  } catch {
    // ignore
  }
  return true;
}

export function loadPersistedClaims(fallback: Claim[]): Claim[] {
  if (!canPersistToDisk()) return fallback;
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

/** Never throws — disk persistence is optional (serverless is in-memory only). */
export function persistClaims(claims: Claim[]): void {
  if (!canPersistToDisk()) return;

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2));
  } catch (error) {
    console.warn(
      "[MapPersistence] Skipping disk write:",
      error instanceof Error ? error.message : error,
    );
  }
}

export function exportClaimsSnapshot(claims: Claim[]): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), claims }, null, 2);
}
