import type { ComposedEvidenceCard } from "./evidenceCard.js";
import {
  getOpenAIClient,
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "./openaiClient.js";
import type { FactCheckHit } from "../data/demoFactChecks.js";
import type { NewsOutlet } from "../data/newsOutlets.js";
import { analyzeRegionalIntelligence } from "./regionalIntelligence.js";

const TODAY = new Date().toISOString().slice(0, 10);

function ratingToOutcome(rating: string): "verified" | "not_verified" | "inconclusive" {
  const r = rating.toLowerCase();
  if (
    r.includes("false") ||
    r.includes("pants on fire") ||
    r.includes("debunked") ||
    r.includes("misleading")
  ) {
    return "not_verified";
  }
  if (r.includes("true") && !r.includes("false") && !r.includes("mostly false")) {
    return "verified";
  }
  return "inconclusive";
}

function buildDemoNewsCard(
  claim: string,
  outlet: NewsOutlet | null,
  factChecks: FactCheckHit[],
): ComposedEvidenceCard {
  const intel = analyzeRegionalIntelligence(claim, claim);
  const primaryFactCheck = factChecks[0];
  const outcome = primaryFactCheck
    ? ratingToOutcome(primaryFactCheck.rating)
    : "inconclusive";

  const sourceReferences = [
    ...factChecks.slice(0, 3).map((fc) => ({
      title: `${fc.publisher} — ${fc.rating}`,
      url: fc.reviewUrl ?? fc.url,
      date: fc.date,
      snippet: fc.claim,
    })),
    ...intel.recommendedSources.slice(0, 2).map((s) => ({
      title: s.name,
      url: s.url,
      date: TODAY,
      snippet: s.description,
    })),
  ];

  const official = intel.recommendedSources[0];
  const outletNote = outlet
    ? `${outlet.name} (${outlet.tierLabel}): ${outlet.nutritionSummary}`
    : "Publisher not in our curated registry — verify the original source before sharing.";

  return {
    summary: `News claim: "${claim}". ${primaryFactCheck ? `${primaryFactCheck.publisher} rated a similar claim "${primaryFactCheck.rating}".` : "No exact third-party fact-check match — check official sources."} Outlet context: ${outletNote}`,
    plainLanguageSummary: primaryFactCheck
      ? `This headline may be misleading. ${primaryFactCheck.publisher} already reviewed a similar claim and rated it "${primaryFactCheck.rating}". Check official sources before you share.`
      : `We could not find a direct fact-check for this exact headline. Check the original publisher and official Georgia sources before sharing.`,
    valuesBridge:
      "Your family deserves accurate news — especially when push alerts spread faster than corrections.",
    confidenceBand: primaryFactCheck ? "medium" : "low",
    verificationOutcome: outcome,
    verificationOutcomeConfidence: primaryFactCheck ? 78 : 45,
    recommendation:
      primaryFactCheck?.rating.toLowerCase().includes("false")
        ? "Do not share this headline until you read the linked fact-check and official source."
        : "Read the original article and cross-check with official local sources.",
    actionSteps: [
      primaryFactCheck
        ? `Read the fact-check: ${primaryFactCheck.publisher} — ${primaryFactCheck.rating}`
        : "Search PolitiFact or Snopes for similar claims",
      outlet?.homepageUrl
        ? `Open the publisher: ${outlet.name}`
        : "Identify the original publisher behind any aggregator link",
      official
        ? `Confirm with official source: ${official.name}`
        : "Call 211 for local service navigation",
      "Share the corrected summary with family in their language",
    ],
    doNotDo: [
      "Do not forward push alerts without reading the full article",
      "Do not treat outlet tier as proof a specific headline is true or false",
      "Do not share screenshots without the fact-check link attached",
    ],
    primaryActionLabel: primaryFactCheck
      ? `Read ${primaryFactCheck.publisher} review`
      : official
        ? `Open ${official.name}`
        : "Call 211",
    primaryActionUrl:
      primaryFactCheck?.reviewUrl ??
      primaryFactCheck?.url ??
      official?.url ??
      "https://www.211.org",
    sourceReferences,
    translations: {
      somali: `Warbaahinta: ${claim}. Fadlan akhri xaqiijinta ka hor intaadan wadaagin.`,
      spanish: `Noticia: ${claim}. Lea la verificación antes de compartir con su familia.`,
    },
    urgentReview: !primaryFactCheck || outcome === "inconclusive",
  };
}

export async function composeNewsActionCard(
  claim: string,
  headline: string,
  outlet: NewsOutlet | null,
  factChecks: FactCheckHit[],
): Promise<ComposedEvidenceCard> {
  const demo = buildDemoNewsCard(claim, outlet, factChecks);

  try {
    const openai = getOpenAIClient();
    const outletBlock = outlet
      ? `Publisher: ${outlet.name}\nTier: ${outlet.tier} — ${outlet.tierLabel}\nNutrition: ${outlet.nutritionSummary}`
      : "Publisher: Unknown (not in registry)";

    const fcBlock =
      factChecks.length > 0
        ? factChecks
            .map(
              (fc) =>
                `- ${fc.publisher}: "${fc.rating}" (${fc.date}) — ${fc.claim}`,
            )
            .join("\n")
        : "No third-party fact-checks found for this query.";

    const intel = analyzeRegionalIntelligence(claim, claim);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You compose News Watch Action Cards for NomaeTrust.
Never label an outlet "fake news." Cite third-party fact-checks only.
Use 6th-grade reading level. Today is ${TODAY}.
Return verificationOutcome: verified | not_verified | inconclusive based on fact-check ratings.`,
        },
        {
          role: "user",
          content: `Headline: ${headline}
Extracted claim: ${claim}

${outletBlock}

Existing fact-checks:
${fcBlock}

Official local sources: ${intel.recommendedSources.map((s) => s.name).join(", ")}

Return JSON with: summary, plainLanguageSummary, valuesBridge, confidenceBand (low|medium|high), verificationOutcome, verificationOutcomeConfidence (0-100), recommendation, actionSteps (array), doNotDo (array), primaryActionLabel, primaryActionUrl, sourceReferences (array of {title,url,date,snippet}), translations {somali, spanish}, urgentReview (boolean).`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return demo;

    const parsed = JSON.parse(content) as Partial<ComposedEvidenceCard>;
    return {
      ...demo,
      ...parsed,
      sourceReferences:
        Array.isArray(parsed.sourceReferences) && parsed.sourceReferences.length > 0
          ? parsed.sourceReferences
          : demo.sourceReferences,
      translations: parsed.translations ?? demo.translations,
      actionSteps: Array.isArray(parsed.actionSteps)
        ? parsed.actionSteps
        : demo.actionSteps,
      doNotDo: Array.isArray(parsed.doNotDo) ? parsed.doNotDo : demo.doNotDo,
    };
  } catch (error) {
    logOpenAIError("News Watch Action Card", error);
    if (shouldFallbackToDemoMode(error)) return demo;
    throw error;
  }
}

export type NewsWatchCheckResult = {
  claim: string;
  headline: string;
  outlet: NewsOutlet | null;
  factChecks: FactCheckHit[];
  evidenceCard: ComposedEvidenceCard;
  mapClaimId: string;
  demoMode: boolean;
};
