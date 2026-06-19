/**
 * Trusted official sources for RAG verification and regional intelligence.
 * Built from the Georgia government websites knowledge base:
 * https://docs.google.com/document/d/16gwFqc6S-zfMo0oYHyeJLT4aXrhqoSoI_yfVtkdXfX0/edit
 */
import {
  GOVERNMENT_KNOWLEDGE_DOC_URL,
  GOVERNMENT_WEBSITES,
} from "./governmentWebsites.js";

export { GOVERNMENT_KNOWLEDGE_DOC_URL };

export type SourceCategory =
  | "Education"
  | "Health"
  | "Public Safety"
  | "Government"
  | "Community Services"
  | "Transportation";

export type ClaimCategory =
  | "Schools"
  | "Food Banks"
  | "Public Health"
  | "Transportation"
  | "Emergency Alerts"
  | "General";

export type TrustedSource = {
  id: string;
  name: string;
  category: SourceCategory;
  claimCategories: ClaimCategory[];
  locations: string[];
  url: string;
  description: string;
  highValue?: boolean;
};

export const TRUSTED_SOURCES: TrustedSource[] = GOVERNMENT_WEBSITES.map(
  ({ id, name, category, claimCategories, locations, url, description, highValue }) => ({
    id,
    name,
    category,
    claimCategories,
    locations,
    url,
    description,
    highValue,
  }),
);

export const HIGH_VALUE_SOURCE_IDS = new Set(
  TRUSTED_SOURCES.filter((s) => s.highValue).map((s) => s.id),
);

export const LOCATION_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "Fulton County", pattern: /\bfulton county\b/i },
  { name: "DeKalb County", pattern: /\bdekalb county\b|\bdekalb\b/i },
  { name: "Gwinnett County", pattern: /\bgwinnett county\b|\bgwinnett\b/i },
  { name: "Cobb County", pattern: /\bcobb county\b|\bcobb\b/i },
  { name: "Forsyth County", pattern: /\bforsyth county\b|\bforsyth\b/i },
  { name: "Clayton County", pattern: /\bclayton county\b|\bclayton\b/i },
  { name: "Cherokee County", pattern: /\bcherokee county\b/i },
  { name: "Hall County", pattern: /\bhall county\b/i },
  { name: "Atlanta", pattern: /\batlanta\b|\bATL\b/ },
  { name: "Decatur", pattern: /\bdecatur\b/i },
  { name: "Marietta", pattern: /\bmarietta\b/i },
  { name: "Sandy Springs", pattern: /\bsandy springs\b/i },
  { name: "Roswell", pattern: /\broswell\b/i },
  { name: "Georgia", pattern: /\bgeorgia\b|\b(?:^|\s)GA(?:\s|$|[.,])/i },
];

export const CATEGORY_RULES: {
  claimCategory: ClaimCategory;
  sourceCategory: SourceCategory;
  keywords: RegExp[];
}[] = [
  {
    claimCategory: "Food Banks",
    sourceCategory: "Community Services",
    keywords: [
      /\bfood bank\b/i,
      /\bfood pantry\b/i,
      /\bfood assistance\b/i,
      /\bfood distribution\b/i,
      /\bhunger\b/i,
      /\bSNAP\b/i,
    ],
  },
  {
    claimCategory: "Schools",
    sourceCategory: "Education",
    keywords: [
      /\bschool\b/i,
      /\bstudent/i,
      /\bdistrict\b/i,
      /\bclass(es)?\b/i,
      /\buniversity\b/i,
      /\bcampus\b/i,
    ],
  },
  {
    claimCategory: "Public Health",
    sourceCategory: "Health",
    keywords: [
      /\bhealth department\b/i,
      /\bpublic health\b/i,
      /\boutbreak\b/i,
      /\bvaccin/i,
      /\bcontamin/i,
      /\bwater supply\b/i,
      /\bboil water\b/i,
      /\bvirus\b/i,
      /\bdisease\b/i,
      /\bhospital\b/i,
      /\bmedicaid\b/i,
    ],
  },
  {
    claimCategory: "Transportation",
    sourceCategory: "Transportation",
    keywords: [
      /\btraffic\b/i,
      /\btransit\b/i,
      /\bmarta\b/i,
      /\bhighway\b/i,
      /\broad closure\b/i,
      /\bairport\b/i,
      /\bflight\b/i,
      /\bbus\b/i,
      /\btrain\b/i,
      /\bcobblinc\b/i,
    ],
  },
  {
    claimCategory: "Emergency Alerts",
    sourceCategory: "Public Safety",
    keywords: [
      /\bemergency\b/i,
      /\balert\b/i,
      /\bcurfew\b/i,
      /\bevacuat/i,
      /\bwarning\b/i,
      /\bdisaster\b/i,
      /\btornado\b/i,
      /\bflood\b/i,
      /\blockdown\b/i,
      /\bgema\b/i,
    ],
  },
  {
    claimCategory: "General",
    sourceCategory: "Community Services",
    keywords: [
      /\b211\b/i,
      /\bhomeless\b/i,
      /\bshelter\b/i,
      /\bhousing\b/i,
      /\brent assist/i,
      /\butility assist/i,
      /\blibrary\b/i,
      /\bpark\b/i,
      /\brecreation center\b/i,
    ],
  },
];
