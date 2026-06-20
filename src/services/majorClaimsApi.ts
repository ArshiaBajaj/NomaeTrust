import type { Claim } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function fetchMajorClaims(): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/map/claims/major`);
  if (!res.ok) throw new Error("Failed to load major claims.");
  const data = (await res.json()) as { claims: Claim[] };
  return data.claims;
}
