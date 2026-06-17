import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { extractClaim } from "../services/claims.js";
import { DEMO_ANALYSIS_RESULT } from "../services/demoMode.js";
import { composeEvidenceCard } from "../services/evidenceCard.js";
import {
  logOpenAIError,
  shouldFallbackToDemoMode,
  toUserFacingOpenAIError,
} from "../services/openaiClient.js";
import { analyzeRegionalIntelligence } from "../services/regionalIntelligence.js";
import { extractTextFromImage } from "../services/vision.js";
import { transcribeAudio } from "../services/whisper.js";
import { addClaim } from "../store/mapStore.js";

const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".webm",
  ".ogg",
  ".mp4",
  ".mov",
  ".caf",
  ".aac",
  ".flac",
]);

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isAudioFile(mimetype: string, originalname: string): boolean {
  if (mimetype.startsWith("audio/") || mimetype.startsWith("video/")) return true;
  if (mimetype === "application/octet-stream") {
    return AUDIO_EXTENSIONS.has(path.extname(originalname).toLowerCase());
  }
  return false;
}

function isImageFile(mimetype: string, originalname: string): boolean {
  if (mimetype.startsWith("image/")) return true;
  if (mimetype === "application/octet-stream") {
    return IMAGE_EXTENSIONS.has(path.extname(originalname).toLowerCase());
  }
  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

async function runAnalysisPipeline(
  transcript: string,
  sourceType: "voice" | "screenshot",
) {
  const { claim, confidence, status } = await extractClaim(transcript);
  const regionalIntelligence = analyzeRegionalIntelligence(transcript, claim);
  const evidence = await composeEvidenceCard(
    claim,
    transcript,
    regionalIntelligence,
    confidence,
  );

  const bandToRisk = { low: "low", medium: "medium", high: "high" } as const;

  addClaim({
    text: claim,
    source: sourceType,
    confidence,
    status: status === "verified" ? "verified" : "pending",
    location: {
      lat: 33.749,
      lng: -84.388,
      label: regionalIntelligence.locations.join(", ") || "Atlanta, GA",
    },
    urgentReview: evidence.urgentReview,
  });

  return {
    transcript,
    claim,
    confidence,
    status,
    regionalIntelligence,
    evidenceCard: {
      summary: evidence.summary,
      plainLanguageSummary: evidence.plainLanguageSummary,
      valuesBridge: evidence.valuesBridge,
      confidenceBand: evidence.confidenceBand,
      recommendation: evidence.recommendation,
      actionSteps: evidence.actionSteps,
      doNotDo: evidence.doNotDo,
      primaryActionLabel: evidence.primaryActionLabel,
      primaryActionUrl: evidence.primaryActionUrl,
      sourceReferences: evidence.sourceReferences,
      translations: evidence.translations,
      urgentReview: evidence.urgentReview,
      riskLevel: bandToRisk[evidence.confidenceBand],
    },
    demoMode: false as const,
  };
}

router.post(
  "/analyze-audio",
  (req, res, next) => {
    upload.single("audio")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "Audio file must be under 25 MB" });
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
        res.status(400).json({ error: "No audio file provided. Use field name 'audio'." });
        return;
      }

      const transcript = await transcribeAudio(
        req.file.buffer,
        req.file.originalname || "audio.mp3",
        req.file.mimetype,
      );

      if (!transcript) {
        res.status(422).json({ error: "Transcription returned empty text" });
        return;
      }

      const result = await runAnalysisPipeline(transcript, "voice");
      res.json(result);
    } catch (error) {
      if (shouldFallbackToDemoMode(error)) {
        logOpenAIError("analyze-audio demo fallback", error);
      }
      const { message: demoReason } = toUserFacingOpenAIError(error);
      const demo = DEMO_ANALYSIS_RESULT;
      const regionalIntelligence = analyzeRegionalIntelligence(
        demo.transcript,
        demo.claim,
      );
      const evidence = await composeEvidenceCard(
        demo.claim,
        demo.transcript,
        regionalIntelligence,
        demo.confidence,
      );
      addClaim({
        text: demo.claim,
        source: "voice",
        confidence: demo.confidence,
        urgentReview: true,
      });
      res.json({
        ...demo,
        demoReason,
        regionalIntelligence,
        evidenceCard: {
          summary: evidence.summary,
          plainLanguageSummary: evidence.plainLanguageSummary,
          valuesBridge: evidence.valuesBridge,
          confidenceBand: evidence.confidenceBand,
          recommendation: evidence.recommendation,
          actionSteps: evidence.actionSteps,
          doNotDo: evidence.doNotDo,
          primaryActionLabel: evidence.primaryActionLabel,
          primaryActionUrl: evidence.primaryActionUrl,
          sourceReferences: evidence.sourceReferences,
          translations: evidence.translations,
          urgentReview: evidence.urgentReview,
          riskLevel: evidence.confidenceBand,
        },
      });
    }
  },
);

router.post(
  "/analyze-image",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
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

      if (!isImageFile(req.file.mimetype, req.file.originalname)) {
        res.status(400).json({ error: "Unsupported image type" });
        return;
      }

      const { text, confidence: ocrConfidence } = await extractTextFromImage(
        req.file.buffer,
        req.file.mimetype,
      );

      const result = await runAnalysisPipeline(text, "screenshot");

      res.json({
        ...result,
        ocr: {
          text,
          confidence: ocrConfidence,
          regions: text.split("\n").filter(Boolean).length,
        },
      });
    } catch (error) {
      logOpenAIError("analyze-image", error);
      res.status(500).json({ error: "Image analysis failed" });
    }
  },
);

export { isAudioFile, isImageFile };
export default router;
