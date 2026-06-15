import { mockCommunityClaims, mockMapHotspots } from "../data/mockClaims";
import type { Claim, MapHotspot } from "../types";

const MOCK_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMapHotspots(): Promise<MapHotspot[]> {
  await delay(MOCK_DELAY_MS);
  return mockMapHotspots;
}

export async function getCommunityClaims(): Promise<Claim[]> {
  await delay(MOCK_DELAY_MS);
  return mockCommunityClaims;
}

export async function reportClaim(claimText: string): Promise<Claim> {
  await delay(600);

  return {
    id: `cm-${Date.now()}`,
    text: claimText,
    source: "community",
    status: "pending",
    confidence: 0.5,
    extractedAt: new Date().toISOString(),
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 2,
      lng: -122.4194 + (Math.random() - 0.5) * 2,
      label: "Community Report",
    },
  };
}
