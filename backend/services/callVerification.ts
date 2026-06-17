import type { VoicePassport } from "../types/call.js";

const SCAM_TRANSCRIPT =
  "Hello, this is calling from social services. I need your bank account and routing number immediately to process your emergency assistance. Do not tell anyone about this call.";

const VERIFIED_TRANSCRIPT =
  "Hi Fatima, it's your cousin Amina. The food bank on Memorial Drive is still open until 6pm today. I'll meet you there after work.";

const SCAM_CLAIM =
  "Caller requests bank account details claiming to be a social worker for emergency assistance.";

const VERIFIED_CLAIM =
  "Atlanta Community Food Bank on Memorial Drive remains open until 6pm today.";

export type CallVerifyRequest = {
  scenario: "registered" | "unregistered";
  challengeResponse?: string;
  expectedChallengeCode?: string;
  passport?: VoicePassport | null;
};

export type CallVerifyResponse = {
  callerName: string;
  isVerified: boolean;
  deepfakeRiskScore: number;
  voicePassport: VoicePassport | null;
  analysis: string;
  recommendation: string;
  challengeCode: string;
  challengePassed: boolean | null;
  detectedClaim: string | null;
  transcript: string;
};

export function verifyCallSimulation(
  req: CallVerifyRequest,
): CallVerifyResponse {
  const challengeCode = req.expectedChallengeCode ?? "SUNFLOWER";
  const normalize = (s: string) => s.trim().toUpperCase().replace(/\s+/g, " ");
  const challengePassed =
    req.challengeResponse === undefined
      ? null
      : normalize(req.challengeResponse) === normalize(challengeCode);

  if (req.scenario === "registered" && req.passport) {
    const passed = challengePassed !== false;
    return {
      callerName: req.passport.contactName,
      isVerified: passed,
      deepfakeRiskScore: passed ? 0.09 : 0.42,
      voicePassport: req.passport,
      analysis: passed
        ? `Voice biometrics match enrolled passport (${req.passport.voiceprintId}). Challenge-response ${challengePassed === true ? "confirmed" : "pending — ask caller to repeat family code"}. Natural speech patterns detected.`
        : "Voice passport partial match but challenge-response failed. Possible impersonation attempt.",
      recommendation: passed
        ? "Caller verified. Safe to continue — still verify any financial requests independently."
        : "Challenge failed. Hang up and call back using a known number.",
      challengeCode,
      challengePassed,
      detectedClaim: VERIFIED_CLAIM,
      transcript: VERIFIED_TRANSCRIPT,
    };
  }

  return {
    callerName: "Unknown — claims social services",
    isVerified: false,
    deepfakeRiskScore: challengePassed === true ? 0.62 : 0.86,
    voicePassport: null,
    analysis:
      "No enrolled voice passport. Elevated synthetic speech indicators. Caller used urgency framing and requests sensitive financial data — consistent with impersonation scams.",
    recommendation:
      "Do not share bank details. Hang up and contact your local NGO or official agency using a verified number. Alert trusted family contacts.",
    challengeCode,
    challengePassed,
    detectedClaim: SCAM_CLAIM,
    transcript: SCAM_TRANSCRIPT,
  };
}
