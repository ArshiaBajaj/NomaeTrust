import {
  CATEGORY_RULES,
  LOCATION_PATTERNS,
  TRUSTED_SOURCES,
  type ClaimCategory,
  type SourceCategory,
  type TrustedSource,
} from "../data/trustedSources.js";

const DEFAULT_LOCATIONS = ["Atlanta", "Georgia"];

export type RegionalIntelligence = {
  locations: string[];
  claimCategory: ClaimCategory;
  sourceCategory: SourceCategory;
  recommendedSources: TrustedSource[];
};

function detectLocations(text: string): string[] {
  const found = LOCATION_PATTERNS.filter(({ pattern }) =>
    pattern.test(text),
  ).map(({ name }) => name);
  return found.length > 0 ? found : DEFAULT_LOCATIONS;
}

function detectCategory(text: string): {
  claimCategory: ClaimCategory;
  sourceCategory: SourceCategory;
} {
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => kw.test(text))) {
      return {
        claimCategory: rule.claimCategory,
        sourceCategory: rule.sourceCategory,
      };
    }
  }
  return { claimCategory: "General", sourceCategory: "Government" };
}

function scoreSource(
  source: TrustedSource,
  locations: string[],
  claimCategory: ClaimCategory,
): number {
  let score = 0;
  if (source.claimCategories.includes(claimCategory)) score += 10;
  else if (source.claimCategories.includes("General")) score += 3;

  for (const loc of locations) {
    if (source.locations.includes(loc)) {
      score += loc === "Atlanta" || loc.includes("County") ? 5 : 3;
    }
  }
  return score;
}

function recommendSources(
  locations: string[],
  claimCategory: ClaimCategory,
): TrustedSource[] {
  return TRUSTED_SOURCES.filter(
    (source) =>
      source.claimCategories.includes(claimCategory) ||
      source.claimCategories.includes("General") ||
      claimCategory === "General",
  )
    .map((source) => ({ source, score: scoreSource(source, locations, claimCategory) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ source }) => source);
}

export function analyzeRegionalIntelligence(
  transcript: string,
  claim: string,
): RegionalIntelligence {
  const combined = `${transcript} ${claim}`;
  const locations = detectLocations(combined);
  const { claimCategory, sourceCategory } = detectCategory(combined);
  const recommendedSources = recommendSources(locations, claimCategory);

  return { locations, claimCategory, sourceCategory, recommendedSources };
}

export function retrieveSources(
  transcript: string,
  claim: string,
): RegionalIntelligence {
  return analyzeRegionalIntelligence(transcript, claim);
}
