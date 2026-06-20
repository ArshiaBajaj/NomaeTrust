import { Router } from "express";
import { reviewContentForPublish } from "../services/platformPublishGate.js";
import {
  getPlatformPolicy,
  getPlatformReviewById,
  getPlatformReviews,
  getPlatformStats,
  overridePlatformReview,
  updatePlatformPolicy,
  type PublishStatus,
} from "../store/platformStore.js";

const router = Router();

function checkApiKey(req: import("express").Request, res: import("express").Response): boolean {
  const configured = process.env.EXTENSION_API_KEY;
  if (!configured || configured === "your_extension_api_key_here") {
    return true;
  }

  const provided = req.header("x-nomaetrust-key");
  if (provided !== configured) {
    res.status(401).json({ error: "Invalid or missing X-NomaeTrust-Key header." });
    return false;
  }
  return true;
}

router.get("/platform/stats", (_req, res) => {
  res.json(getPlatformStats());
});

router.get("/platform/policies", (_req, res) => {
  res.json(getPlatformPolicy());
});

router.patch("/platform/policies", (req, res) => {
  const patch = req.body ?? {};
  res.json(updatePlatformPolicy(patch));
});

router.get("/platform/reviews", (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json({ reviews: getPlatformReviews(Number.isFinite(limit) ? limit : 50) });
});

router.get("/platform/reviews/:id", (req, res) => {
  const review = getPlatformReviewById(req.params.id);
  if (!review) {
    res.status(404).json({ error: "Review not found." });
    return;
  }
  res.json(review);
});

router.post("/platform/submit", async (req, res) => {
  if (!checkApiKey(req, res)) return;

  try {
    const platformId = typeof req.body?.platformId === "string" ? req.body.platformId.trim() : "";
    const platformName =
      typeof req.body?.platformName === "string" ? req.body.platformName.trim() : "";
    const contentType = req.body?.contentType;
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const url = typeof req.body?.url === "string" ? req.body.url.trim() : undefined;
    const authorId =
      typeof req.body?.authorId === "string" ? req.body.authorId.trim() : undefined;

    if (!platformId || !platformName) {
      res.status(400).json({ error: "platformId and platformName are required." });
      return;
    }

    if (!text && !url) {
      res.status(400).json({ error: "Provide text or url to review." });
      return;
    }

    const validTypes = ["post", "comment", "message", "article"];
    if (!validTypes.includes(contentType)) {
      res.status(400).json({ error: 'contentType must be post, comment, message, or article.' });
      return;
    }

    const review = await reviewContentForPublish({
      platformId,
      platformName,
      contentType,
      text,
      url,
      authorId,
    });

    res.json(review);
  } catch (err) {
    console.error("[Platform] submit failed:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Platform review failed.",
    });
  }
});

router.patch("/platform/reviews/:id", (req, res) => {
  const publishStatus = req.body?.publishStatus as PublishStatus;
  if (!["approved", "hold", "blocked"].includes(publishStatus)) {
    res.status(400).json({ error: "publishStatus must be approved, hold, or blocked." });
    return;
  }

  const note = typeof req.body?.note === "string" ? req.body.note : undefined;
  const updated = overridePlatformReview(req.params.id, publishStatus, note);
  if (!updated) {
    res.status(404).json({ error: "Review not found." });
    return;
  }
  res.json(updated);
});

export default router;
