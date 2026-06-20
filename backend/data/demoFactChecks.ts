export type FactCheckHit = {
  id: string;
  publisher: string;
  rating: string;
  claim: string;
  url: string;
  date: string;
  reviewUrl?: string;
};

/** Curated ClaimReview-style entries for demo when Google Fact Check API is unavailable. */
export const DEMO_FACT_CHECKS: FactCheckHit[] = [
  {
    id: "demo-fc-1",
    publisher: "PolitiFact",
    rating: "Mostly False",
    claim: "Atlanta Public Schools announced a district-wide closure with no official notice.",
    url: "https://www.politifact.com/",
    date: "2024-11-12",
    reviewUrl: "https://www.politifact.com/",
  },
  {
    id: "demo-fc-2",
    publisher: "Snopes",
    rating: "False",
    claim: "Boil water advisory issued for all of Atlanta with no Georgia EPD confirmation.",
    url: "https://www.snopes.com/",
    date: "2024-08-03",
    reviewUrl: "https://www.snopes.com/",
  },
  {
    id: "demo-fc-3",
    publisher: "FactCheck.org",
    rating: "Misleading",
    claim: "Federal agents are conducting door-to-door vaccine enforcement in Georgia neighborhoods.",
    url: "https://www.factcheck.org/",
    date: "2025-01-18",
    reviewUrl: "https://www.factcheck.org/",
  },
  {
    id: "demo-fc-4",
    publisher: "AP Fact Check",
    rating: "False",
    claim: "MARTA shut down all rail service indefinitely due to a safety emergency.",
    url: "https://apnews.com/APFactCheck",
    date: "2024-09-22",
    reviewUrl: "https://apnews.com/APFactCheck",
  },
  {
    id: "demo-fc-5",
    publisher: "PolitiFact",
    rating: "Half True",
    claim: "Georgia food banks are facing record demand but some locations changed hours.",
    url: "https://www.politifact.com/",
    date: "2025-02-05",
    reviewUrl: "https://www.politifact.com/",
  },
  {
    id: "demo-fc-6",
    publisher: "Snopes",
    rating: "False",
    claim: "Old flooding photos from Chennai are being shared as current Atlanta water contamination.",
    url: "https://www.snopes.com/",
    date: "2026-01-14",
    reviewUrl: "https://www.snopes.com/",
  },
  {
    id: "demo-fc-7",
    publisher: "Reuters Fact Check",
    rating: "False",
    claim: "Election officials in Georgia deleted millions of voter records before an election.",
    url: "https://www.reuters.com/fact-check/",
    date: "2024-10-30",
    reviewUrl: "https://www.reuters.com/fact-check/",
  },
  {
    id: "demo-fc-8",
    publisher: "AJC Verify",
    rating: "Needs context",
    claim: "APS calendar change rumor spread before official board vote.",
    url: "https://www.ajc.com/",
    date: "2025-03-01",
    reviewUrl: "https://www.ajc.com/",
  },
];

export function searchDemoFactChecks(query: string, limit = 5): FactCheckHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  if (terms.length === 0) return DEMO_FACT_CHECKS.slice(0, limit);

  const scored = DEMO_FACT_CHECKS.map((hit) => {
    const haystack = `${hit.claim} ${hit.publisher} ${hit.rating}`.toLowerCase();
    const score = terms.reduce((n, term) => (haystack.includes(term) ? n + 1 : n), 0);
    return { hit, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return DEMO_FACT_CHECKS.slice(0, limit);
  return scored.slice(0, limit).map(({ hit }) => hit);
}
