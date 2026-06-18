import { Router } from "express";
import {
  addClaim,
  getClaims,
  getHotspots,
  getValidatorQueue,
  validateClaim,
} from "../store/mapStore.js";

const router = Router();

router.get("/map/hotspots", (_req, res) => {
  res.json(getHotspots());
});

router.get("/map/claims", (_req, res) => {
  res.json(getClaims());
});

router.get("/map/validator-queue", (_req, res) => {
  res.json(getValidatorQueue());
});

router.post("/map/claims", (req, res) => {
  const { text, source, confidence, urgentReview } = req.body as {
    text?: string;
    source?: "voice" | "screenshot" | "call" | "community" | "deepfake";
    confidence?: number;
    urgentReview?: boolean;
  };

  if (!text?.trim()) {
    res.status(400).json({ error: "Claim text is required" });
    return;
  }

  const claim = addClaim({
    text: text.trim(),
    source,
    confidence,
    urgentReview,
  });
  res.status(201).json(claim);
});

router.post("/map/validate", (req, res) => {
  const { claimId, validatorId, badge } = req.body as {
    claimId?: string;
    validatorId?: string;
    badge?: string;
  };

  if (!claimId || !validatorId || !badge) {
    res.status(400).json({ error: "claimId, validatorId, and badge are required" });
    return;
  }

  const updated = validateClaim(claimId, validatorId, badge);
  if (!updated) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  res.json(updated);
});

export default router;
