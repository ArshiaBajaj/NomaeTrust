import { lookupOutletFromUrl } from "../data/newsOutlets.js";
import type { NewsOutlet } from "../data/newsOutlets.js";
import type { FactCheckHit } from "../data/demoFactChecks.js";
import { extractClaim } from "./claims.js";
import { searchFactChecks } from "./factCheckSearch.js";
import { composeNewsActionCard } from "./newsWatchAnalysis.js";
import type { ComposedEvidenceCard } from "./evidenceCard.js";
import { addClaim } from "../store/mapStore.js";

export type ExtensionPlatform = "reddit" | "discord" | "web";

export type CompactExtensionResult = {
  claim: string;
  outlet: Pick<NewsOutlet, "name" | "tier" | "tierLabel"> | null;
  factChecks: Array<Pick<FactCheckHit, "publisher" | "rating" | "url" | "reviewUrl">>;
  outcome: "verified" | "not_verified" | "inconclusive";
  confidenceBand: "low" | "medium" | "high";
  actionSummary: string;
  actionSteps: string[];
  cardUrl: string;
  mapClaimId: string;
  demoMode: boolean;
};

function headlineFromUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    const slug = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    if (!slug) return `Story from ${parsed.hostname.replace(/^www\./, "")}`;
    return decodeURIComponent(slug)
      .replace(/[-_+]/g, " ")
      .replace(/\.\w+$/, "")
      .slice(0, 200);
  } catch {
    return "Shared news story";
  }
}

function categoryForPlatform(platform: ExtensionPlatform): string {
  if (platform === "reddit") return "Reddit";
  if (platform === "discord") return "Discord";
  return "News";
}

function buildCardUrl(
  baseUrl: string,
  claim: string,
  url: string | undefined,
  platform: ExtensionPlatform,
): string {
  const params = new URLSearchParams();
  if (claim) params.set("headline", claim);
  if (url) params.set("url", url);
  params.set("from", platform);
  params.set("share", "1");
  const root = baseUrl.replace(/\/$/, "");
  return `${root}/news-watch?${params.toString()}`;
}

export async function runExtensionVerify(input: {
  text: string;
  url?: string;
  platform: ExtensionPlatform;
  frontendBaseUrl?: string;
}): Promise<CompactExtensionResult> {
  const text = input.text.trim();
  const url = input.url?.trim() ?? "";
  const platform = input.platform;

  if (!text && !url) {
    throw new Error("Provide text or url to verify.");
  }

  const inputText = text || url;
  const outlet = url ? lookupOutletFromUrl(url) : null;

  let claim = text || headlineFromUrl(url);
  let extractionConfidence = 0.7;

  if (text) {
    try {
      const extracted = await extractClaim(text);
      claim = extracted.claim;
      extractionConfidence = extracted.confidence;
    } catch {
      claim = text;
    }
  } else if (outlet) {
    claim = `Shared ${outlet.name} story: ${headlineFromUrl(url)}`;
  }

  const { hits: factChecks, demoMode } = await searchFactChecks(claim, 5);
  const evidenceCard: ComposedEvidenceCard = await composeNewsActionCard(
    claim,
    inputText,
    outlet,
    factChecks,
  );

  const mapClaim = addClaim({
    text: claim,
    source: "news",
    confidence: extractionConfidence,
    category: categoryForPlatform(platform),
    analysisOutcome: evidenceCard.verificationOutcome,
    analysisConfidence: evidenceCard.verificationOutcomeConfidence / 100,
    sourceReferences: evidenceCard.sourceReferences,
    primaryActionLabel: evidenceCard.primaryActionLabel,
    primaryActionUrl: evidenceCard.primaryActionUrl,
    urgentReview: evidenceCard.urgentReview,
    locationHints: ["Atlanta", "Georgia"],
  });

  const frontendBase =
    input.frontendBaseUrl ??
    process.env.FRONTEND_BASE_URL ??
    "http://localhost:5173";

  return {
    claim,
    outlet: outlet
      ? { name: outlet.name, tier: outlet.tier, tierLabel: outlet.tierLabel }
      : null,
    factChecks: factChecks.slice(0, 3).map((fc) => ({
      publisher: fc.publisher,
      rating: fc.rating,
      url: fc.url,
      reviewUrl: fc.reviewUrl,
    })),
    outcome: evidenceCard.verificationOutcome,
    confidenceBand: evidenceCard.confidenceBand,
    actionSummary:
      evidenceCard.plainLanguageSummary ?? evidenceCard.summary,
    actionSteps: (evidenceCard.actionSteps ?? []).slice(0, 3),
    cardUrl: buildCardUrl(frontendBase, claim, url || undefined, platform),
    mapClaimId: mapClaim.id,
    demoMode,
  };
}
