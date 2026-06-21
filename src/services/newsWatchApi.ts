import type { FactCheckHit, NewsOutlet, NewsWatchCheckResult } from "../types";

import { API_BASE } from "../config/api";

export async function fetchNewsOutlets(): Promise<NewsOutlet[]> {
  const res = await fetch(`${API_BASE}/api/news-watch/outlets`);
  if (!res.ok) throw new Error("Could not load outlets.");
  const data = (await res.json()) as { outlets: NewsOutlet[] };
  return data.outlets;
}

export async function fetchNewsWatchFeed(): Promise<{
  factChecks: FactCheckHit[];
  demoMode: boolean;
}> {
  const res = await fetch(`${API_BASE}/api/news-watch/feed`);
  if (!res.ok) throw new Error("Could not load fact-check feed.");
  return res.json() as Promise<{ factChecks: FactCheckHit[]; demoMode: boolean }>;
}

export async function checkNewsStory(input: {
  headline?: string;
  url?: string;
}): Promise<NewsWatchCheckResult> {
  const res = await fetch(`${API_BASE}/api/news-watch/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "News Watch check failed.");
  }
  return res.json() as Promise<NewsWatchCheckResult>;
}
