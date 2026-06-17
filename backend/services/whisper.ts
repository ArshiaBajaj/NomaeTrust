import path from "node:path";
import { toFile } from "openai";
import {
  getOpenAIClient,
  logOpenAIError,
} from "./openaiClient.js";

const MIME_TO_EXT: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/webm": ".webm",
  "video/webm": ".webm",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/ogg": ".ogg",
  "audio/x-caf": ".caf",
};

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

function normalizeAudioFilename(
  originalname: string,
  mimetype: string,
): string {
  const ext = path.extname(originalname).toLowerCase();
  if (ext && AUDIO_EXTENSIONS.has(ext)) {
    return originalname;
  }

  const mapped = MIME_TO_EXT[mimetype];
  return mapped ? `audio${mapped}` : "audio.mp3";
}

export async function transcribeAudio(
  buffer: Buffer,
  originalname: string,
  mimetype: string,
): Promise<string> {
  const filename = normalizeAudioFilename(originalname, mimetype);
  console.log(
    `[Whisper] Transcribing file="${filename}" mimetype="${mimetype}" bytes=${buffer.length}`,
  );

  try {
    const openai = getOpenAIClient();
    const file = await toFile(buffer, filename);

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      response_format: "text",
    });

    const text =
      typeof response === "string" ? response.trim() : String(response).trim();

    console.log(`[Whisper] Transcription complete (${text.length} chars)`);
    return text;
  } catch (error) {
    logOpenAIError("Whisper transcription", error);
    throw error;
  }
}
