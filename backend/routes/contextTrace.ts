import { Router } from "express";
import multer from "multer";
import {
  analyzeContextTrace,
  analyzeContextTraceFromUrl,
} from "../services/contextTrace/analyzeContextTrace.js";
import { addClaim } from "../store/mapStore.js";

const MAP_VERDICT_LABELS = new Set(["Reused Media", "Misleading", "Out of Context"]);

function maybeAddContextTraceClaim(
  result: Awaited<ReturnType<typeof analyzeContextTrace>>,
) {
  if (!MAP_VERDICT_LABELS.has(result.verdict.label)) return result;

  const claimText =
    result.currentClaim.summary ||
    result.currentClaim.title ||
    result.imageDescription;

  const mapClaim = addClaim({
    text: claimText,
    source: "context-trace",
    confidence: result.verdict.confidence / 100,
    analysisOutcome: "not_verified",
    analysisConfidence: result.verdict.confidence / 100,
    narrativeDriftScore: result.narrativeDriftScore,
    category: "General",
    urgentReview: result.narrativeDriftBand === "high",
    locationHints: result.originalContext.source
      ? [result.originalContext.source]
      : [],
  });

  return { ...result, mapClaimId: mapClaim.id };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: process.env.VERCEL ? 4 * 1024 * 1024 : 15 * 1024 * 1024,
  },
});

const router = Router();

router.post(
  "/context-trace/analyze",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "Image must be under 15 MB" });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image provided. Use field name 'image'." });
        return;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowed.includes(req.file.mimetype)) {
        res.status(400).json({ error: "Supported formats: JPG, PNG, WEBP" });
        return;
      }

      const result = await analyzeContextTrace(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname || "upload.jpg",
      );

      res.json(maybeAddContextTraceClaim(result));
    } catch (error) {
      console.error("[ContextTrace] analyze failed:", error);
      res.status(500).json({ error: "Context Trace analysis failed" });
    }
  },
);

router.post("/context-trace/analyze-url", async (req, res) => {
  try {
    const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";
    if (!url) {
      res.status(400).json({ error: "Image URL is required." });
      return;
    }

    const result = await analyzeContextTraceFromUrl(url);
    res.json(maybeAddContextTraceClaim(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Context Trace URL analysis failed";
    console.error("[ContextTrace] analyze-url failed:", error);
    res.status(400).json({ error: message });
  }
});

export default router;
