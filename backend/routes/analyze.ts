import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { extractClaim } from "../services/claims.js";
import { DEMO_ANALYSIS_RESULT } from "../services/demoMode.js";
import {
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "../services/openaiClient.js";
import { transcribeAudio } from "../services/whisper.js";

const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".webm",
  ".ogg",
  ".mp4",
  ".caf",
  ".aac",
  ".flac",
]);

function isAudioFile(mimetype: string, originalname: string): boolean {
  if (mimetype.startsWith("audio/") || mimetype === "video/webm") {
    return true;
  }

  if (mimetype === "application/octet-stream") {
    const ext = path.extname(originalname).toLowerCase();
    return AUDIO_EXTENSIONS.has(ext);
  }

  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isAudioFile(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    cb(
      new Error(
        `Unsupported file type "${file.mimetype}". Use MP3, WAV, M4A, or WEBM.`,
      ),
    );
  },
});

const router = Router();

router.use((req, res, next) => {
  const start = Date.now();
  console.log(
    `[API] --> ${req.method} ${req.originalUrl} content-type=${req.headers["content-type"] ?? "none"}`,
  );
  res.on("finish", () => {
    console.log(
      `[API] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - start}ms)`,
    );
  });
  next();
});

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
        res
          .status(400)
          .json({ error: "No audio file provided. Use field name 'audio'." });
        return;
      }

      console.log(
        `[API] analyze-audio received file="${req.file.originalname}" mimetype="${req.file.mimetype}" size=${req.file.size}`,
      );

      const transcript = await transcribeAudio(
        req.file.buffer,
        req.file.originalname || "audio.mp3",
        req.file.mimetype,
      );

      if (!transcript) {
        res.status(422).json({ error: "Transcription returned empty text" });
        return;
      }

      const { claim, confidence, status } = await extractClaim(transcript);

      console.log("[API] analyze-audio success");

      res.json({
        transcript,
        claim,
        confidence,
        status,
        demoMode: false,
      });
    } catch (error) {
      if (shouldFallbackToDemoMode(error)) {
        logOpenAIError("analyze-audio demo fallback", error);
        console.warn("[API] OpenAI unavailable — returning demo mode result");
        res.json(DEMO_ANALYSIS_RESULT);
        return;
      }

      console.error("[API] analyze-audio failed, falling back to demo:", error);
      res.json(DEMO_ANALYSIS_RESULT);
    }
  },
);

export default router;
