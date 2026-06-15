import { Router } from "express";
import multer from "multer";
import { extractClaim } from "../services/claims.js";
import { transcribeAudio } from "../services/whisper.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/") || file.mimetype === "video/webm") {
      cb(null, true);
      return;
    }
    cb(new Error("Only audio files are supported"));
  },
});

const router = Router();

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
      );

      if (!transcript) {
        res.status(422).json({ error: "Transcription returned empty text" });
        return;
      }

      const { claim, confidence, status } = await extractClaim(transcript);

      res.json({
        transcript,
        claim,
        confidence,
        status,
      });
    } catch (error) {
      console.error("Audio analysis failed:", error);

      const message =
        error instanceof Error ? error.message : "Audio analysis failed";

      if (message.includes("OPENAI_API_KEY")) {
        res.status(503).json({ error: message });
        return;
      }

      if (message.includes("401") || message.includes("Incorrect API key")) {
        res.status(401).json({ error: "Invalid OpenAI API key" });
        return;
      }

      res.status(500).json({ error: message });
    }
  },
);

export default router;
