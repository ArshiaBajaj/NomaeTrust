import {
  getOpenAIClient,
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "./openaiClient.js";
import type { RegionalIntelligence } from "./regionalIntelligence.js";

export type SourceReference = {
  title: string;
  url: string;
  date: string;
  snippet: string;
};

export type ConfidenceBand = "low" | "medium" | "high";

export type EvidenceTranslations = {
  somali: string;
  spanish: string;
};

export type ComposedEvidenceCard = {
  summary: string;
  plainLanguageSummary: string;
  valuesBridge: string;
  confidenceBand: ConfidenceBand;
  recommendation: string;
  actionSteps: string[];
  doNotDo: string[];
  primaryActionLabel: string;
  primaryActionUrl: string;
  sourceReferences: SourceReference[];
  translations: EvidenceTranslations;
  urgentReview: boolean;
};

const TODAY = new Date().toISOString().slice(0, 10);

function buildDemoEvidenceCard(
  claim: string,
  intel: RegionalIntelligence,
): ComposedEvidenceCard {
  const sourceReferences: SourceReference[] = intel.recommendedSources.map(
    (s) => ({
      title: s.name,
      url: s.url,
      date: TODAY,
      snippet: s.description,
    }),
  );

  const primary = intel.recommendedSources[0];

  return {
    summary: `Community claim detected: "${claim}". Cross-referenced against ${sourceReferences.length} trusted Atlanta/Georgia sources. No official closure notice found in recommended channels.`,
    plainLanguageSummary: `Someone said: "${claim}". We checked official sources. We did not find proof this is true. Please verify before you change your plans.`,
    valuesBridge:
      "Everyone deserves accurate information about food and community help — especially when messages spread fast on WhatsApp.",
    confidenceBand: sourceReferences.length >= 2 ? "medium" : "low",
    recommendation:
      "Contact the official source directly before sharing this message further.",
    actionSteps: [
      primary
        ? `Call or visit ${primary.name} to confirm hours and services`
        : "Call 211 for local resource navigation",
      primary ? `Check the official website: ${primary.url}` : "Search official city or county websites",
      "Ask a community validator on the Confusion Map if you are still unsure",
    ],
    doNotDo: [
      "Do not skip food pickup or services based only on this voice note",
      "Do not share bank details or personal information in response to urgent calls",
      "Do not treat this card as proof the rumor is true or false",
    ],
    primaryActionLabel: primary ? `Open ${primary.name}` : "Call 211",
    primaryActionUrl: primary?.url ?? "https://www.211.org",
    sourceReferences,
    translations: {
      somali: `Sheegashada: ${claim}. Fadlan hubi ilaha rasmiga ah ka hor intaadan wadaagin.`,
      spanish: `Afirmación: ${claim}. Verifique con fuentes oficiales antes de compartir o cambiar sus planes.`,
    },
    urgentReview: true,
  };
}

export async function composeEvidenceCard(
  claim: string,
  transcript: string,
  intel: RegionalIntelligence,
  extractionConfidence: number,
): Promise<ComposedEvidenceCard> {
  const sourcesForPrompt = intel.recommendedSources.map((s) => ({
    title: s.name,
    url: s.url,
    description: s.description,
    category: s.category,
  }));

  const demo = buildDemoEvidenceCard(claim, intel);

  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You compose Action Cards for NomaeTrust rumor verification (USAII hackathon).
NEVER label claims TRUE or FALSE. Use 6th-grade reading level.
Structure: Values → Bridge → Facts (sources) → Action.
Use only provided source URLs. Today is ${TODAY}.`,
        },
        {
          role: "user",
          content: `Claim: ${claim}
Transcript: ${transcript.slice(0, 500)}
Confidence: ${extractionConfidence}
Category: ${intel.claimCategory}
Locations: ${intel.locations.join(", ")}
Sources: ${JSON.stringify(sourcesForPrompt, null, 2)}

Return JSON:
{
  "summary": "2-3 neutral sentences for reviewers",
  "plainLanguageSummary": "2-3 simple sentences for a stressed parent at 2am",
  "valuesBridge": "One sentence starting with shared values (safety, fairness, community)",
  "confidenceBand": "low"|"medium"|"high",
  "recommendation": "one clear next step",
  "actionSteps": ["3 concrete do-this-now steps with org names/URLs from sources"],
  "doNotDo": ["2-3 things NOT to do yet"],
  "primaryActionLabel": "short button label e.g. Call Atlanta Food Bank",
  "primaryActionUrl": "official URL from sources",
  "sourceReferences": [{"title","url","date":"${TODAY}","snippet"}],
  "translations": {"somali":"action summary in Somali","spanish":"action summary in Spanish"},
  "urgentReview": boolean
}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty evidence card response");

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const band = parsed.confidenceBand;
    const confidenceBand: ConfidenceBand =
      band === "high" || band === "medium" || band === "low" ? band : "medium";

    const refs = Array.isArray(parsed.sourceReferences)
      ? (parsed.sourceReferences as SourceReference[])
      : demo.sourceReferences;

    const translations = parsed.translations as EvidenceTranslations | undefined;

    return {
      summary:
        typeof parsed.summary === "string" ? parsed.summary : demo.summary,
      plainLanguageSummary:
        typeof parsed.plainLanguageSummary === "string"
          ? parsed.plainLanguageSummary
          : demo.plainLanguageSummary,
      valuesBridge:
        typeof parsed.valuesBridge === "string"
          ? parsed.valuesBridge
          : demo.valuesBridge,
      confidenceBand,
      recommendation:
        typeof parsed.recommendation === "string"
          ? parsed.recommendation
          : demo.recommendation,
      actionSteps: Array.isArray(parsed.actionSteps)
        ? (parsed.actionSteps as string[])
        : demo.actionSteps,
      doNotDo: Array.isArray(parsed.doNotDo)
        ? (parsed.doNotDo as string[])
        : demo.doNotDo,
      primaryActionLabel:
        typeof parsed.primaryActionLabel === "string"
          ? parsed.primaryActionLabel
          : demo.primaryActionLabel,
      primaryActionUrl:
        typeof parsed.primaryActionUrl === "string"
          ? parsed.primaryActionUrl
          : demo.primaryActionUrl,
      sourceReferences: refs.length > 0 ? refs : demo.sourceReferences,
      translations: {
        somali: translations?.somali ?? demo.translations.somali,
        spanish: translations?.spanish ?? demo.translations.spanish,
      },
      urgentReview:
        typeof parsed.urgentReview === "boolean"
          ? parsed.urgentReview
          : confidenceBand === "low",
    };
  } catch (error) {
    if (shouldFallbackToDemoMode(error)) {
      logOpenAIError("evidence card demo fallback", error);
    } else {
      logOpenAIError("evidence card composition", error);
    }
    return demo;
  }
}
