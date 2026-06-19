import { Router } from "express";
import {
  buildDetectiveChallengeDeck,
  DETECTIVE_CLIP_MANIFEST,
  getDetectiveSetupStatus,
} from "../data/detectiveClipSources.js";
import { scoreVideoWithHive } from "../services/detective/hiveVideoScore.js";

const router = Router();

router.get("/detective/challenges", (_req, res) => {
  const deck = buildDetectiveChallengeDeck();
  const setup = getDetectiveSetupStatus();
  res.json({
    challenges: deck,
    setup,
    faceForensics: setup.faceForensics,
    sdfvd: setup.sdfvd,
    sources: DETECTIVE_CLIP_MANIFEST.map(({ id, dataset, label, method, notes }) => ({
      id,
      dataset,
      label,
      method,
      notes,
    })),
    hiveConfigured: Boolean(
      process.env.HIVE_API_KEY && process.env.HIVE_API_KEY !== "your_hive_api_key_here",
    ),
  });
});

router.get("/detective/setup", (_req, res) => {
  res.json(getDetectiveSetupStatus());
});

router.post("/detective/score-url", async (req, res) => {
  const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  if (!url) {
    res.status(400).json({ error: "Video URL is required." });
    return;
  }

  const score = await scoreVideoWithHive(url);
  if (!score) {
    res.status(503).json({
      error: "Hive API unavailable — add HIVE_API_KEY to backend/.env",
    });
    return;
  }

  res.json(score);
});

export default router;
