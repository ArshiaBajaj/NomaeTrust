import { randomUUID } from "node:crypto";
import {
  DEMO_FACT_CHECKS,
  searchDemoFactChecks,
  type FactCheckHit,
} from "../data/demoFactChecks.js";

const FACT_CHECK_API =
  "https://factchecktools.googleapis.com/v1alpha1/claims:search";

type GoogleClaimReview = {
  publisher?: { name?: string; site?: string };
  url?: string;
  title?: string;
  reviewDate?: string;
  textualRating?: string;
};

type GoogleClaim = {
  text?: string;
  claimDate?: string;
  claimReview?: GoogleClaimReview[];
};

type GoogleSearchResponse = {
  claims?: GoogleClaim[];
};

function normalizeHit(
  claimText: string,
  review: GoogleClaimReview,
  claimDate?: string,
): FactCheckHit {
  return {
    id: `fc-${randomUUID().slice(0, 8)}`,
    publisher: review.publisher?.name ?? "Fact-checker",
    rating: review.textualRating ?? "Reviewed",
    claim: claimText,
    url: review.url ?? review.publisher?.site ?? "",
    date: review.reviewDate ?? claimDate ?? new Date().toISOString().slice(0, 10),
    reviewUrl: review.url,
  };
}

export async function searchFactChecks(
  query: string,
  limit = 5,
): Promise<{ hits: FactCheckHit[]; demoMode: boolean }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { hits: DEMO_FACT_CHECKS.slice(0, limit), demoMode: true };
  }

  const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
  if (!apiKey || apiKey === "your_google_fact_check_api_key_here") {
    console.log("[FactCheck] No API key — using demo fact-check data");
    return { hits: searchDemoFactChecks(trimmed, limit), demoMode: true };
  }

  try {
    const params = new URLSearchParams({
      query: trimmed,
      key: apiKey,
      pageSize: String(Math.min(limit, 10)),
      languageCode: "en",
    });

    const res = await fetch(`${FACT_CHECK_API}?${params.toString()}`);
    if (!res.ok) {
      console.warn(`[FactCheck] API ${res.status} — falling back to demo data`);
      return { hits: searchDemoFactChecks(trimmed, limit), demoMode: true };
    }

    const data = (await res.json()) as GoogleSearchResponse;
    const hits: FactCheckHit[] = [];

    for (const claim of data.claims ?? []) {
      const claimText = claim.text ?? trimmed;
      for (const review of claim.claimReview ?? []) {
        hits.push(normalizeHit(claimText, review, claim.claimDate));
        if (hits.length >= limit) break;
      }
      if (hits.length >= limit) break;
    }

    if (hits.length === 0) {
      return { hits: searchDemoFactChecks(trimmed, limit), demoMode: true };
    }

    return { hits, demoMode: false };
  } catch (err) {
    console.warn("[FactCheck] Search failed:", err);
    return { hits: searchDemoFactChecks(trimmed, limit), demoMode: true };
  }
}

export function getTrendingFactChecks(limit = 8): FactCheckHit[] {
  return DEMO_FACT_CHECKS.slice(0, limit);
}
