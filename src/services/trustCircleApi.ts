import type { TrustCircleAuthResponse, TrustCircleMe } from "../types/trustCircle";

import { API_BASE } from "../config/api";
const SESSION_KEY = "nomae-trust-circle-session";

export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearStoredSessionToken(): void {
  localStorage.removeItem(SESSION_KEY);
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createTrustCircle(
  familyName: string,
  displayName: string,
): Promise<TrustCircleAuthResponse> {
  const res = await fetch(`${API_BASE}/api/trust-circle/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ familyName, displayName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create family");
  setStoredSessionToken(data.sessionToken);
  return data as TrustCircleAuthResponse;
}

export async function joinTrustCircle(
  inviteCode: string,
  displayName: string,
): Promise<TrustCircleAuthResponse> {
  const res = await fetch(`${API_BASE}/api/trust-circle/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviteCode, displayName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to join family");
  setStoredSessionToken(data.sessionToken);
  return data as TrustCircleAuthResponse;
}

export async function fetchTrustCircleMe(
  token?: string,
): Promise<TrustCircleMe | null> {
  const sessionToken = token ?? getStoredSessionToken();
  if (!sessionToken) return null;

  const res = await fetch(`${API_BASE}/api/trust-circle/me`, {
    headers: authHeaders(sessionToken),
  });

  if (res.status === 401) {
    clearStoredSessionToken();
    return null;
  }

  if (!res.ok) throw new Error("Failed to load Trust Circle");
  return res.json() as Promise<TrustCircleMe>;
}

export async function leaveTrustCircle(): Promise<void> {
  const token = getStoredSessionToken();
  if (!token) return;

  await fetch(`${API_BASE}/api/trust-circle/leave`, {
    method: "POST",
    headers: authHeaders(token),
  });
  clearStoredSessionToken();
}

export function formatInviteCodeInput(value: string): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (raw.length <= 3) return raw;
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}
