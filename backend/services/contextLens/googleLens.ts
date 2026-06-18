export type WebImageMatch = {
  title: string;
  link: string;
  source?: string;
  date?: string;
  thumbnail?: string;
  snippet?: string;
};

type SerpReverseImageResponse = {
  image_results?: Array<{
    title?: string;
    link?: string;
    source?: string;
    date?: string;
    thumbnail?: string;
    snippet?: string;
    displayed_link?: string;
  }>;
  inline_images?: Array<{
    title?: string;
    link?: string;
    source?: string;
    thumbnail?: string;
    original?: string;
  }>;
  search_information?: {
    query_displayed?: string;
    total_results?: number;
  };
  error?: string;
};

type SerpLensResponse = {
  visual_matches?: Array<{
    title?: string;
    link?: string;
    source?: string;
    date?: string;
    thumbnail?: string;
  }>;
  error?: string;
};

function isPublicImageUrl(url: string): boolean {
  if (!url || url.startsWith("upload://")) return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return false;
    }
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseDateHint(displayed?: string): string | undefined {
  if (!displayed) return undefined;
  const yearMatch = displayed.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return yearMatch[0];
  if (/\d+\s+hours?\s+ago/i.test(displayed)) return new Date().getFullYear().toString();
  if (/\d+\s+days?\s+ago/i.test(displayed)) return new Date().getFullYear().toString();
  const yearsAgo = displayed.match(/(\d+)\s+years?\s+ago/i);
  if (yearsAgo) {
    return String(new Date().getFullYear() - Number(yearsAgo[1]));
  }
  return undefined;
}

function dedupeMatches(matches: WebImageMatch[]): WebImageMatch[] {
  const seen = new Set<string>();
  return matches.filter((m) => {
    const key = m.link.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function serpFetch(
  params: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || apiKey === "your_serpapi_key_here") return null;

  const query = new URLSearchParams({ ...params, api_key: apiKey });
  const response = await fetch(`https://serpapi.com/search.json?${query}`);
  if (!response.ok) {
    console.error("[ContextLens] SerpAPI error:", response.status);
    return null;
  }
  return response.json() as Promise<Record<string, unknown>>;
}

async function searchGoogleLens(imageUrl: string): Promise<WebImageMatch[]> {
  const data = (await serpFetch({
    engine: "google_lens",
    url: imageUrl,
  })) as SerpLensResponse | null;

  if (!data || data.error) return [];

  return (data.visual_matches ?? [])
    .filter((m) => m.link && m.title)
    .map((m) => ({
      title: m.title!,
      link: m.link!,
      source: m.source,
      date: m.date,
      thumbnail: m.thumbnail,
    }));
}

function tryHostname(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

export type ReverseImageSearchResult = {
  matches: WebImageMatch[];
  usedReverseImage: boolean;
  usedLens: boolean;
  queryDisplayed?: string;
  totalResults?: number;
};

/** SerpAPI requires a publicly accessible image URL (not local uploads). */
export async function searchImageProvenance(
  imageUrl: string,
): Promise<ReverseImageSearchResult> {
  if (!isPublicImageUrl(imageUrl)) {
    return { matches: [], usedReverseImage: false, usedLens: false };
  }

  const [reverseData, lensMatches] = await Promise.all([
    (async () => {
      const data = (await serpFetch({
        engine: "google_reverse_image",
        image_url: imageUrl,
        google_domain: "google.com",
        hl: "en",
        gl: "us",
      })) as SerpReverseImageResponse | null;
      return data;
    })(),
    searchGoogleLens(imageUrl),
  ]);

  const reverseMatches = reverseData
    ? dedupeMatches([
        ...(reverseData.image_results ?? [])
          .filter((m) => m.link && m.title)
          .map((m) => ({
            title: m.title!,
            link: m.link!,
            source: m.source,
            date: m.date ?? parseDateHint(m.displayed_link),
            thumbnail: m.thumbnail,
            snippet: m.snippet,
          })),
        ...(reverseData.inline_images ?? [])
          .filter((m) => m.source || m.link)
          .map((m) => ({
            title: m.title ?? "Related image",
            link: m.source ?? m.link!,
            source: tryHostname(m.source ?? m.link),
            thumbnail: m.thumbnail ?? m.original,
          })),
      ])
    : [];

  const matches = dedupeMatches([...reverseMatches, ...lensMatches]).slice(0, 15);

  return {
    matches,
    usedReverseImage: reverseMatches.length > 0,
    usedLens: lensMatches.length > 0,
    queryDisplayed: reverseData?.search_information?.query_displayed,
    totalResults: reverseData?.search_information?.total_results,
  };
}

// Back-compat alias
export type LensMatch = WebImageMatch;
export { searchImageProvenance as searchGoogleLens };

export function extractYearFromMatch(match: WebImageMatch): number | null {
  if (match.date) {
    const year = Number(String(match.date).slice(0, 4));
    if (year >= 1990 && year <= 2100) return year;
  }
  const fromTitle = match.title.match(/\b(19|20)\d{2}\b/);
  if (fromTitle) return Number(fromTitle[0]);
  const fromLink = match.link.match(/\b(19|20)\d{2}\b/);
  if (fromLink) return Number(fromLink[0]);
  return null;
}
