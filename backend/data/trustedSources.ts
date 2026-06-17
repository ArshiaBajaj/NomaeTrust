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
};

export const TRUSTED_SOURCES: TrustedSource[] = [
  {
    id: "atlanta-public-schools",
    name: "Atlanta Public Schools",
    category: "Education",
    claimCategories: ["Schools"],
    locations: ["Atlanta", "Fulton County", "Georgia"],
    url: "https://www.atlantapublicschools.us",
    description: "Official closures, schedules, and district announcements.",
  },
  {
    id: "fulton-county-schools",
    name: "Fulton County Schools",
    category: "Education",
    claimCategories: ["Schools"],
    locations: ["Fulton County", "Atlanta", "Georgia"],
    url: "https://www.fcschools.org",
    description: "County-wide school district alerts and calendar updates.",
  },
  {
    id: "dph-georgia",
    name: "Georgia Department of Public Health",
    category: "Health",
    claimCategories: ["Public Health", "Emergency Alerts"],
    locations: ["Georgia", "Atlanta", "Fulton County"],
    url: "https://dph.georgia.gov",
    description: "State health alerts, outbreak notices, and vaccination info.",
  },
  {
    id: "acfb",
    name: "Atlanta Community Food Bank",
    category: "Community Services",
    claimCategories: ["Food Banks"],
    locations: ["Atlanta", "Fulton County", "Georgia"],
    url: "https://www.acfb.org",
    description: "Official food bank hours, closures, and distribution schedules.",
  },
  {
    id: "city-of-atlanta",
    name: "City of Atlanta Official Website",
    category: "Government",
    claimCategories: ["General", "Emergency Alerts"],
    locations: ["Atlanta", "Georgia"],
    url: "https://www.atlantaga.gov",
    description: "Official city announcements, ordinances, and civic updates.",
  },
  {
    id: "fulton-county-gov",
    name: "Fulton County Government",
    category: "Government",
    claimCategories: ["General", "Emergency Alerts"],
    locations: ["Fulton County", "Atlanta", "Georgia"],
    url: "https://www.fultoncountyga.gov",
    description: "County government services, closures, and public notices.",
  },
  {
    id: "gema",
    name: "Georgia Emergency Management Agency",
    category: "Public Safety",
    claimCategories: ["Emergency Alerts"],
    locations: ["Georgia", "Atlanta", "Fulton County"],
    url: "https://gema.georgia.gov",
    description: "Statewide emergency alerts, weather, and disaster response.",
  },
  {
    id: "marta",
    name: "MARTA",
    category: "Transportation",
    claimCategories: ["Transportation"],
    locations: ["Atlanta", "Fulton County", "Georgia"],
    url: "https://www.itsmarta.com",
    description: "Official transit schedules, delays, and service disruptions.",
  },
  {
    id: "united-way-atlanta",
    name: "United Way of Greater Atlanta",
    category: "Community Services",
    claimCategories: ["Food Banks", "General"],
    locations: ["Atlanta", "Fulton County", "Georgia"],
    url: "https://www.unitedwayatlanta.org",
    description: "Community resource referrals and verified assistance programs.",
  },
  {
    id: "grady-health",
    name: "Grady Health System",
    category: "Health",
    claimCategories: ["Public Health", "Emergency Alerts"],
    locations: ["Atlanta", "Fulton County", "Georgia"],
    url: "https://www.gradyhealth.org",
    description: "Atlanta public hospital — emergency and health updates.",
  },
];

export const LOCATION_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "Fulton County", pattern: /\bfulton county\b/i },
  { name: "Atlanta", pattern: /\batlanta\b/i },
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
    ],
  },
  {
    claimCategory: "Schools",
    sourceCategory: "Education",
    keywords: [/\bschool\b/i, /\bstudent/i, /\bdistrict\b/i, /\bclass(es)?\b/i],
  },
  {
    claimCategory: "Public Health",
    sourceCategory: "Health",
    keywords: [
      /\bhealth department\b/i,
      /\bpublic health\b/i,
      /\boutbreak\b/i,
      /\bcontamin/i,
      /\bwater supply\b/i,
      /\bhospital\b/i,
    ],
  },
  {
    claimCategory: "Transportation",
    sourceCategory: "Transportation",
    keywords: [/\btraffic\b/i, /\btransit\b/i, /\bmarta\b/i, /\bairport\b/i],
  },
  {
    claimCategory: "Emergency Alerts",
    sourceCategory: "Public Safety",
    keywords: [
      /\bemergency\b/i,
      /\balert\b/i,
      /\bcurfew\b/i,
      /\bwarning\b/i,
      /\blockdown\b/i,
    ],
  },
];
