import { extractExifMetadata, exifToDisplay } from "../contextLens/exifMetadata.js";
import { logOpenAIError } from "../openaiClient.js";
import type { ContextTraceAnalysis } from "../../types/contextTrace.js";
import { buildDemoAnalysis } from "./demoAnalysis.js";
import { attachPreviewToTimeline, tryGptContextTraceAnalysis } from "./gptAnalysis.js";

function formatExifSummary(
  exifDisplay: ReturnType<typeof exifToDisplay>,
  exifFound: boolean,
): string {
  if (!exifFound) {
    return "No EXIF metadata found — common after social media re-uploads.";
  }
  return [
    `GPS: ${exifDisplay.gps}`,
    `Captured: ${exifDisplay.captured}`,
    `Published: ${exifDisplay.published}`,
    exifDisplay.device ? `Device: ${exifDisplay.device}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function analyzeContextTrace(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<ContextTraceAnalysis> {
  const previewDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const exifRaw = await extractExifMetadata(buffer);
  const exifDisplay = exifToDisplay(exifRaw);
  const exifFound = Boolean(exifRaw);

  const exif: ContextTraceAnalysis["exif"] = {
    found: exifFound,
    captured: exifDisplay.captured,
    published: exifDisplay.published,
    device: exifDisplay.device,
    gps: exifDisplay.gps,
    software: exifFound ? undefined : "Not available — typical after social re-upload",
  };

  let gpt: Awaited<ReturnType<typeof tryGptContextTraceAnalysis>> = null;
  try {
    gpt = await tryGptContextTraceAnalysis({
      imageDataUrl: previewDataUrl,
      fileName,
      exifSummary: formatExifSummary(exifDisplay, exifFound),
    });
  } catch (error) {
    logOpenAIError("context trace unexpected", error);
  }

  if (gpt) {
    return {
      previewDataUrl,
      fileName,
      exif,
      ...gpt,
      timeline: attachPreviewToTimeline(gpt.timeline, previewDataUrl),
      demoMode: false,
    };
  }

  return buildDemoAnalysis(
    previewDataUrl,
    fileName,
    exif,
    "OpenAI analysis unavailable — showing curated demo trace. Add a valid OPENAI_API_KEY to backend/.env for live GPT-4o analysis.",
  );
}
