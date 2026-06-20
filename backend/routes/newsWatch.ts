import { Router } from "express";
import { NEWS_OUTLETS, lookupOutletFromUrl } from "../data/newsOutlets.js";
import { extractClaim } from "../services/claims.js";
import { getTrendingFactChecks, searchFactChecks } from "../services/factCheckSearch.js";
import {
  composeNewsActionCard,
  type NewsWatchCheckResult,
} from "../services/newsWatchAnalysis.js";
import { addClaim } from "../store/mapStore.js";

const router = Router();

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

router.get("/news-watch/outlets", (_req, res) => {
  res.json({ outlets: NEWS_OUTLETS });
});

router.get("/news-watch/feed", async (_req, res) => {
  const { hits, demoMode } = await searchFactChecks("Atlanta schools health election", 8);
  res.json({
    factChecks: hits.length > 0 ? hits : getTrendingFactChecks(8),
    demoMode,
  });
});

router.post("/news-watch/check", async (req, res) => {
  try {
    const headline =
      typeof req.body?.headline === "string" ? req.body.headline.trim() : "";
    const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";

    if (!headline && !url) {
      res.status(400).json({ error: "Provide a headline or URL to check." });
      return;
    }

    const inputText = headline || url;
    const outlet = url ? lookupOutletFromUrl(url) : null;

    let claim = headline || headlineFromUrl(url);
    let extractionConfidence = 0.7;

    if (headline) {
      try {
        const extracted = await extractClaim(headline);
        claim = extracted.claim;
        extractionConfidence = extracted.confidence;
      } catch {
        claim = headline;
      }
    } else if (outlet) {
      claim = `Shared ${outlet.name} story: ${headlineFromUrl(url)}`;
    }

    const { hits: factChecks, demoMode: fcDemoMode } = await searchFactChecks(claim, 5);
    const evidenceCard = await composeNewsActionCard(
      claim,
      inputText,
      outlet,
      factChecks,
    );

    const mapClaim = addClaim({
      text: claim,
      source: "news",
      confidence: extractionConfidence,
      category: "News",
      analysisOutcome: evidenceCard.verificationOutcome,
      analysisConfidence: evidenceCard.verificationOutcomeConfidence / 100,
      sourceReferences: evidenceCard.sourceReferences,
      primaryActionLabel: evidenceCard.primaryActionLabel,
      primaryActionUrl: evidenceCard.primaryActionUrl,
      urgentReview: evidenceCard.urgentReview,
      locationHints: ["Atlanta", "Georgia"],
    });

    const result: NewsWatchCheckResult = {
      claim,
      headline: inputText,
      outlet,
      factChecks,
      evidenceCard,
      mapClaimId: mapClaim.id,
      demoMode: fcDemoMode,
    };

    res.json(result);
  } catch (err) {
    console.error("[NewsWatch] check failed:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "News Watch check failed.",
    });
  }
});

export default router;
