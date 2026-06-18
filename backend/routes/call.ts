import { Router } from "express";
import { verifyCallSimulation } from "../services/callVerification.js";
import { getCurrentTrustPhrase } from "../services/trustWords.js";
import { extractToken } from "./trustCircle.js";
import type { VoicePassport } from "../types/call.js";
import { addClaim } from "../store/mapStore.js";
import { getFamilySecretFromToken } from "../store/trustCircleStore.js";

const router = Router();

router.post("/verify-call", (req, res) => {
  const body = req.body as {
    scenario?: "registered" | "unregistered";
    challengeResponse?: string;
    expectedChallengeCode?: string;
    passport?: VoicePassport | null;
    sessionToken?: string;
  };

  const scenario = body.scenario ?? "unregistered";
  const token =
    extractToken(req.headers.authorization) ?? body.sessionToken ?? null;

  let expectedChallengeCode = body.expectedChallengeCode;
  if (token) {
    const secret = getFamilySecretFromToken(token);
    if (secret) {
      expectedChallengeCode = getCurrentTrustPhrase(secret);
    }
  }

  const result = verifyCallSimulation({
    scenario,
    challengeResponse: body.challengeResponse,
    expectedChallengeCode,
    passport: body.passport ?? null,
  });

  if (result.detectedClaim) {
    addClaim({
      text: result.detectedClaim,
      source: "call",
      confidence: result.isVerified ? 0.72 : 0.38,
      urgentReview: !result.isVerified,
    });
  }

  res.json(result);
});

export default router;
