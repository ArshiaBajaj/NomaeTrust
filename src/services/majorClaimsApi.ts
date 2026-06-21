import type { Claim } from "../types";

import { API_BASE } from "../config/api";

export async function fetchMajorClaims(): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/api/map/claims/major`);
  if (!res.ok) throw new Error("Failed to load major claims.");
  const data = (await res.json()) as { claims: Claim[] };
  return data.claims;
}
