import type { AudienceMode } from "../context/AudienceContext";

/** Canonical route paths — single source of truth for the entire app. */
export const ROUTES = {
  landing: "/",
  choose: "/choose",
  loginIndividual: "/login/individual",
  loginPlatform: "/login/platform",
  home: "/home",
  individual: "/individual",
  platform: "/platform",
  newsWatch: "/news-watch",
  actionCards: "/stress",
  screenshots: "/screenshot",
  detective: "/detective",
  confusionMap: "/trust-map",
  contextTrace: "/call",
  settings: "/settings",
  disclosure: "/disclosure",
  trustCircle: "/trust-circle",
  trustCircleLogin: "/trust-circle/login",
} as const;

/** Legacy aliases that redirect to canonical paths. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/voice": ROUTES.actionCards,
  "/context-trace": ROUTES.contextTrace,
  "/context-lens": ROUTES.contextTrace,
  "/call-verification": ROUTES.contextTrace,
};

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.landing]: "NomaeTrust",
  [ROUTES.choose]: "Choose experience",
  [ROUTES.loginIndividual]: "Sign in",
  [ROUTES.loginPlatform]: "Company sign-in",
  [ROUTES.home]: "NomaeTrust",
  [ROUTES.individual]: "Major claims",
  [ROUTES.platform]: "Publish gate",
  [ROUTES.newsWatch]: "News Watch",
  [ROUTES.actionCards]: "Action Cards",
  [ROUTES.screenshots]: "Screenshots",
  [ROUTES.detective]: "Digital Detective",
  [ROUTES.confusionMap]: "Confusion Map",
  [ROUTES.contextTrace]: "Context Trace",
  [ROUTES.settings]: "Settings",
  [ROUTES.disclosure]: "Disclosure",
  [ROUTES.trustCircle]: "Trust Circle",
  [ROUTES.trustCircleLogin]: "Trust Circle",
};

export type NavLink = { to: string; label: string };

export const INDIVIDUAL_NAV: NavLink[] = [
  { to: ROUTES.individual, label: "Major claims" },
  { to: ROUTES.newsWatch, label: "News Watch" },
  { to: ROUTES.detective, label: "Digital Detective" },
  { to: ROUTES.confusionMap, label: "Confusion Map" },
  { to: ROUTES.actionCards, label: "Action Cards" },
];

export const PLATFORM_NAV: NavLink[] = [
  { to: ROUTES.platform, label: "Publish gate" },
  { to: ROUTES.confusionMap, label: "Confusion Map" },
  { to: ROUTES.disclosure, label: "Disclosure" },
];

export const INDIVIDUAL_FOOTER: NavLink[] = [
  { to: ROUTES.individual, label: "Major claims" },
  { to: ROUTES.newsWatch, label: "News Watch" },
  { to: ROUTES.detective, label: "Digital Detective" },
  { to: ROUTES.actionCards, label: "Action Cards" },
  { to: ROUTES.confusionMap, label: "Confusion Map" },
  { to: ROUTES.disclosure, label: "Disclosure" },
];

export const PLATFORM_FOOTER: NavLink[] = [
  { to: ROUTES.platform, label: "Publish gate" },
  { to: ROUTES.confusionMap, label: "Confusion Map" },
  { to: ROUTES.disclosure, label: "Disclosure" },
  { to: ROUTES.settings, label: "Settings" },
];

export type TabItem = {
  to?: string;
  label: string;
  icon: string;
  end?: boolean;
  action?: "menu" | "queue";
};

export const INDIVIDUAL_TABS: TabItem[] = [
  { to: ROUTES.individual, label: "Claims", icon: "home", end: true },
  { to: ROUTES.newsWatch, label: "Verify", icon: "verify" },
  { to: ROUTES.detective, label: "Detective", icon: "detective" },
  { to: ROUTES.confusionMap, label: "Map", icon: "map" },
  { label: "Profile", icon: "profile", action: "menu" },
];

export const PLATFORM_TABS: TabItem[] = [
  { to: ROUTES.platform, label: "Gate", icon: "home", end: true },
  { to: ROUTES.platform, label: "Queue", icon: "queue", action: "queue" },
  { to: ROUTES.confusionMap, label: "Map", icon: "map" },
  { label: "Profile", icon: "profile", action: "menu" },
];

export const HEADERLESS_ROUTES: ReadonlySet<string> = new Set([
  ROUTES.landing,
  ROUTES.choose,
  ROUTES.loginIndividual,
  ROUTES.loginPlatform,
  ROUTES.settings,
  ROUTES.individual,
  ROUTES.platform,
  ROUTES.home,
]);

export const TABLESS_ROUTES: ReadonlySet<string> = new Set([
  ROUTES.choose,
  ROUTES.landing,
  ROUTES.loginIndividual,
  ROUTES.loginPlatform,
]);

export const IMMERSIVE_ROUTES: ReadonlySet<string> = new Set([ROUTES.detective]);

export function homeForAudience(audience: AudienceMode | null): string {
  if (audience === "platform") return ROUTES.platform;
  if (audience === "individual") return ROUTES.individual;
  return ROUTES.choose;
}

export function audienceForPath(pathname: string): AudienceMode | null {
  if (pathname.startsWith(ROUTES.platform)) return "platform";
  if (
    pathname.startsWith(ROUTES.individual) ||
    pathname.startsWith(ROUTES.newsWatch) ||
    pathname.startsWith(ROUTES.actionCards) ||
    pathname.startsWith(ROUTES.screenshots) ||
    pathname.startsWith(ROUTES.detective)
  ) {
    return "individual";
  }
  return null;
}

export function pageTitle(pathname: string): string {
  const base = pathname.split("#")[0].split("?")[0];
  return PAGE_TITLES[base] ?? "NomaeTrust";
}
