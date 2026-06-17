import { Router } from "express";
import { verifyCallSimulation } from "../services/callVerification.js";
import type { VoicePassport } from "../types/call.js";
import { addClaim } from "../store/mapStore.js";

const router = Router();

router.post("/verify-call", (req, res) => {
  const body = req.body as {
    scenario?: "registered" | "unregistered";
    challengeResponse?: string;
    expectedChallengeCode?: string;
    passport?: VoicePassport | null;
  };

  const scenario = body.scenario ?? "unregistered";
  const result = verifyCallSimulation({
    scenario,
    challengeResponse: body.challengeResponse,
    expectedChallengeCode: body.expectedChallengeCode,
    passport: body.passport ?? null,
  });

  if (result.detectedClaim) {
    addClaim({
      text: result.detectedClaim,
      source: "call",
      confidence: result.isVerified ? 0.72 : 0.38,
      urgentReview: !result.isVerified,
      location: { lat: 33.749, lng: -84.388, label: "Atlanta, GA" },
    });
  }

  res.json(result);
});

export default router;
