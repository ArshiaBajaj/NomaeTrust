export type OutletTier = "A" | "B" | "C" | "D";

export type NewsOutlet = {
  id: string;
  name: string;
  domains: string[];
  tier: OutletTier;
  tierLabel: string;
  ifcnSignatory?: boolean;
  nutritionSummary: string;
  homepageUrl: string;
  factCheckUrl?: string;
};

export const OUTLET_TIER_LABELS: Record<OutletTier, string> = {
  A: "Wire / IFCN fact-checker",
  B: "Established newsroom",
  C: "Opinion or partisan lean",
  D: "Repeatedly debunked pattern",
};

export const NEWS_OUTLETS: NewsOutlet[] = [
  {
    id: "ap",
    name: "Associated Press",
    domains: ["apnews.com", "ap.org"],
    tier: "A",
    tierLabel: OUTLET_TIER_LABELS.A,
    nutritionSummary:
      "Wire service with editorial standards and corrections policy. Primary source for many news apps.",
    homepageUrl: "https://apnews.com",
    factCheckUrl: "https://apnews.com/APFactCheck",
  },
  {
    id: "reuters",
    name: "Reuters",
    domains: ["reuters.com"],
    tier: "A",
    tierLabel: OUTLET_TIER_LABELS.A,
    nutritionSummary:
      "Global wire service. Reuters Fact Check unit publishes structured debunks on viral claims.",
    homepageUrl: "https://www.reuters.com",
    factCheckUrl: "https://www.reuters.com/fact-check/",
  },
  {
    id: "politifact",
    name: "PolitiFact",
    domains: ["politifact.com"],
    tier: "A",
    tierLabel: OUTLET_TIER_LABELS.A,
    ifcnSignatory: true,
    nutritionSummary:
      "IFCN signatory fact-checker. Rates political and viral claims with transparent methodology.",
    homepageUrl: "https://www.politifact.com",
    factCheckUrl: "https://www.politifact.com",
  },
  {
    id: "factcheck-org",
    name: "FactCheck.org",
    domains: ["factcheck.org"],
    tier: "A",
    tierLabel: OUTLET_TIER_LABELS.A,
    ifcnSignatory: true,
    nutritionSummary:
      "IFCN signatory project of the Annenberg Public Policy Center. Nonpartisan claim reviews.",
    homepageUrl: "https://www.factcheck.org",
    factCheckUrl: "https://www.factcheck.org",
  },
  {
    id: "snopes",
    name: "Snopes",
    domains: ["snopes.com"],
    tier: "A",
    tierLabel: OUTLET_TIER_LABELS.A,
    ifcnSignatory: true,
    nutritionSummary:
      "IFCN signatory. Long-running debunking of urban legends, viral hoaxes, and misinformation.",
    homepageUrl: "https://www.snopes.com",
    factCheckUrl: "https://www.snopes.com",
  },
  {
    id: "npr",
    name: "NPR",
    domains: ["npr.org"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "Public radio newsroom with corrections policy. Mix of reporting and analysis segments.",
    homepageUrl: "https://www.npr.org",
  },
  {
    id: "bbc",
    name: "BBC News",
    domains: ["bbc.com", "bbc.co.uk"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "International public broadcaster. BBC Verify team investigates manipulated media.",
    homepageUrl: "https://www.bbc.com/news",
    factCheckUrl: "https://www.bbc.com/news/reality_check",
  },
  {
    id: "cnn",
    name: "CNN",
    domains: ["cnn.com"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "Major national cable/digital newsroom. Separate opinion and breaking news desks.",
    homepageUrl: "https://www.cnn.com",
  },
  {
    id: "fox-news",
    name: "Fox News",
    domains: ["foxnews.com", "foxbusiness.com"],
    tier: "C",
    tierLabel: OUTLET_TIER_LABELS.C,
    nutritionSummary:
      "National outlet with opinion-heavy primetime programming. Distinguish news reporting from commentary.",
    homepageUrl: "https://www.foxnews.com",
  },
  {
    id: "msnbc",
    name: "MSNBC",
    domains: ["msnbc.com"],
    tier: "C",
    tierLabel: OUTLET_TIER_LABELS.C,
    nutritionSummary:
      "Cable news with significant opinion and analysis content alongside breaking news.",
    homepageUrl: "https://www.msnbc.com",
  },
  {
    id: "ajc",
    name: "Atlanta Journal-Constitution",
    domains: ["ajc.com"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "Primary local metro daily for Atlanta. AJC Verify covers Georgia-specific viral claims.",
    homepageUrl: "https://www.ajc.com",
  },
  {
    id: "wabe",
    name: "WABE",
    domains: ["wabe.org"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "Atlanta NPR member station. Local reporting on schools, transit, and community services.",
    homepageUrl: "https://www.wabe.org",
  },
  {
    id: "apple-news",
    name: "Apple News",
    domains: ["apple.news"],
    tier: "B",
    tierLabel: "News aggregator",
    nutritionSummary:
      "Aggregator — reliability depends on the original publisher behind each story. Check the source outlet.",
    homepageUrl: "https://www.apple.com/apple-news/",
  },
  {
    id: "google-news",
    name: "Google News",
    domains: ["news.google.com"],
    tier: "B",
    tierLabel: "News aggregator",
    nutritionSummary:
      "Aggregator ranking headlines from many publishers. Always open the original publisher before sharing.",
    homepageUrl: "https://news.google.com",
  },
  {
    id: "the-gateway-pundit",
    name: "The Gateway Pundit",
    domains: ["thegatewaypundit.com"],
    tier: "D",
    tierLabel: OUTLET_TIER_LABELS.D,
    nutritionSummary:
      "Frequently cited in third-party fact-checks for publishing false or misleading claims. Verify independently.",
    homepageUrl: "https://www.thegatewaypundit.com",
  },
  {
    id: "natural-news",
    name: "Natural News",
    domains: ["naturalnews.com"],
    tier: "D",
    tierLabel: OUTLET_TIER_LABELS.D,
    nutritionSummary:
      "Health misinformation repeatedly debunked by IFCN fact-checkers. Do not use as a primary source.",
    homepageUrl: "https://www.naturalnews.com",
  },
  {
    id: "infowars",
    name: "Infowars",
    domains: ["infowars.com"],
    tier: "D",
    tierLabel: OUTLET_TIER_LABELS.D,
    nutritionSummary:
      "Conspiracy-oriented outlet with a long record of false claims cited in public fact-check databases.",
    homepageUrl: "https://www.infowars.com",
  },
  {
    id: "breitbart",
    name: "Breitbart",
    domains: ["breitbart.com"],
    tier: "C",
    tierLabel: OUTLET_TIER_LABELS.C,
    nutritionSummary:
      "Conservative digital outlet. Several viral claims have received mixed or false ratings from fact-checkers.",
    homepageUrl: "https://www.breitbart.com",
  },
  {
    id: "huffpost",
    name: "HuffPost",
    domains: ["huffpost.com", "huffingtonpost.com"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "Digital news outlet mixing reporting and opinion. Check dateline and original reporting vs. aggregation.",
    homepageUrl: "https://www.huffpost.com",
  },
  {
    id: "wsj",
    name: "Wall Street Journal",
    domains: ["wsj.com"],
    tier: "B",
    tierLabel: OUTLET_TIER_LABELS.B,
    nutritionSummary:
      "National newspaper with separate news and opinion sections. Paywalled primary reporting.",
    homepageUrl: "https://www.wsj.com",
  },
];

export function normalizeDomain(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0]
    .split("/")[0]
    .trim();
}

export function extractDomainFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return normalizeDomain(parsed.hostname);
  } catch {
    return null;
  }
}

export function lookupOutletByDomain(domain: string): NewsOutlet | null {
  const normalized = normalizeDomain(domain);
  return (
    NEWS_OUTLETS.find((outlet) =>
      outlet.domains.some(
        (d) => normalized === d || normalized.endsWith(`.${d}`),
      ),
    ) ?? null
  );
}

export function lookupOutletFromUrl(url: string): NewsOutlet | null {
  const domain = extractDomainFromUrl(url);
  if (!domain) return null;
  return lookupOutletByDomain(domain);
}

export function getOutletById(id: string): NewsOutlet | undefined {
  return NEWS_OUTLETS.find((o) => o.id === id);
}
