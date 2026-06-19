import { Router } from "express";
import {
  addClaim,
  disputeClaim,
  escalateClaim,
  exportMapData,
  getCategoryStats,
  getClaimById,
  getClaims,
  getHotspotClaims,
  getHotspots,
  getNearbyClaims,
  getOfficialFeeds,
  getValidatorQueue,
  subscribeMapEvents,
  validateClaim,
  type ReportClaimInput,
} from "../store/mapStore.js";

const router = Router();

router.get("/map/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  send({ type: "connected" });

  const unsubscribe = subscribeMapEvents((event) => send(event));

  req.on("close", () => {
    unsubscribe();
  });
});

router.get("/map/hotspots", (_req, res) => {
  res.json(getHotspots());
});

router.get("/map/hotspots/:geohash/claims", (req, res) => {
  const claims = getHotspotClaims(req.params.geohash);
  res.json(claims);
});

router.get("/map/claims", (req, res) => {
  const sinceHours = req.query.sinceHours
    ? Number(req.query.sinceHours)
    : undefined;
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;

  res.json(
    getClaims({
      sinceHours: Number.isFinite(sinceHours) ? sinceHours : undefined,
      category,
    }),
  );
});

router.get("/map/claims/:id", (req, res) => {
  const claim = getClaimById(req.params.id);
  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  res.json(claim);
});

router.get("/map/validator-queue", (_req, res) => {
  res.json(getValidatorQueue());
});

router.get("/map/categories", (req, res) => {
  const sinceHours = req.query.sinceHours
    ? Number(req.query.sinceHours)
    : 168;
  res.json(getCategoryStats(Number.isFinite(sinceHours) ? sinceHours : 168));
});

router.get("/map/nearby", (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 8;
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: "lat and lng query params are required" });
    return;
  }

  res.json(
    getNearbyClaims(
      lat,
      lng,
      Number.isFinite(radiusKm) ? radiusKm : 8,
      Number.isFinite(limit) ? limit : 5,
    ),
  );
});

router.get("/map/official-feeds", (_req, res) => {
  res.json(getOfficialFeeds());
});

router.get("/map/export", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", 'attachment; filename="map-export.json"');
  res.send(exportMapData());
});

router.post("/map/claims", (req, res) => {
  const body = req.body as ReportClaimInput & { text?: string };

  if (!body.text?.trim()) {
    res.status(400).json({ error: "Claim text is required" });
    return;
  }

  const claim = addClaim({
    ...body,
    text: body.text.trim(),
  });
  res.status(201).json(claim);
});

router.post("/map/validate", (req, res) => {
  const { claimId, validatorId, badge, notes } = req.body as {
    claimId?: string;
    validatorId?: string;
    badge?: string;
    notes?: string;
  };

  if (!claimId || !validatorId || !badge) {
    res.status(400).json({ error: "claimId, validatorId, and badge are required" });
    return;
  }

  const updated = validateClaim(claimId, validatorId, badge, notes);
  if (!updated) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  res.json(updated);
});

router.post("/map/dispute", (req, res) => {
  const { claimId, validatorId, notes } = req.body as {
    claimId?: string;
    validatorId?: string;
    notes?: string;
  };

  if (!claimId || !validatorId) {
    res.status(400).json({ error: "claimId and validatorId are required" });
    return;
  }

  const updated = disputeClaim(claimId, validatorId, notes);
  if (!updated) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  res.json(updated);
});

router.post("/map/escalate", (req, res) => {
  const { claimId, validatorId, notes } = req.body as {
    claimId?: string;
    validatorId?: string;
    notes?: string;
  };

  if (!claimId || !validatorId) {
    res.status(400).json({ error: "claimId and validatorId are required" });
    return;
  }

  const updated = escalateClaim(claimId, validatorId, notes);
  if (!updated) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  res.json(updated);
});

export default router;
