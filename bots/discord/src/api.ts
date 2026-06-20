export type CompactExtensionResult = {
  claim: string;
  outlet: { name: string; tier: string; tierLabel: string } | null;
  factChecks: Array<{
    publisher: string;
    rating: string;
    url: string;
    reviewUrl?: string;
  }>;
  outcome: "verified" | "not_verified" | "inconclusive";
  confidenceBand: "low" | "medium" | "high";
  actionSummary: string;
  actionSteps: string[];
  cardUrl: string;
  mapClaimId: string;
  demoMode: boolean;
};

export async function verifyWithNomaeTrust(input: {
  text: string;
  url?: string;
  platform: "reddit" | "discord" | "web";
}): Promise<CompactExtensionResult> {
  const apiUrl = (process.env.NOMAE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
  const apiKey = process.env.EXTENSION_API_KEY;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey && apiKey !== "your_extension_api_key_here") {
    headers["X-NomaeTrust-Key"] = apiKey;
  }

  const res = await fetch(`${apiUrl}/api/extension/verify`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<CompactExtensionResult>;
}
