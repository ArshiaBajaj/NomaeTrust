import { extractExifMetadata, exifToDisplay } from "../contextLens/exifMetadata.js";
import { searchImageProvenance } from "../contextLens/googleLens.js";
import { fetchImageBuffer, resolveImageUrl } from "../contextLens/imageFetch.js";
import { logOpenAIError } from "../openaiClient.js";
import type { ContextTraceAnalysis } from "../../types/contextTrace.js";
import { buildDemoAnalysis } from "./demoAnalysis.js";
import {
  attachPreviewToTimeline,
  tryGptContextTraceAnalysis,
  type ContextTraceWebContext,
} from "./gptAnalysis.js";

function fileNameFromUrl(url: string): string {
  try {
    const name = new URL(url).pathname.split("/").pop();
    if (name && name.includes(".")) return decodeURIComponent(name);
  } catch {
    // ignore
  }
  return "image-from-url.jpg";
}

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

async function runContextTraceAnalysis(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  webContext?: ContextTraceWebContext,
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
      webContext,
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

export async function analyzeContextTrace(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<ContextTraceAnalysis> {
  return runContextTraceAnalysis(buffer, mimeType, fileName);
}

export async function analyzeContextTraceFromUrl(
  submittedUrl: string,
): Promise<ContextTraceAnalysis> {
  const trimmed = submittedUrl.trim();
  if (!trimmed) {
    throw new Error("Image URL is required.");
  }

  resolveImageUrl(trimmed);

  const { buffer, mimeType, finalUrl } = await fetchImageBuffer(trimmed);
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(mimeType)) {
    throw new Error("Supported formats: JPG, PNG, WEBP");
  }

  const provenance = await searchImageProvenance(finalUrl);
  const webContext: ContextTraceWebContext = {
    submittedUrl: trimmed,
    resolvedUrl: finalUrl,
    webMatches: provenance.matches,
    reverseImageQuery: provenance.queryDisplayed,
    reverseImageTotalResults: provenance.totalResults,
  };

  const result = await runContextTraceAnalysis(
    buffer,
    mimeType,
    fileNameFromUrl(finalUrl),
    webContext,
  );

  if (!provenance.usedReverseImage && !provenance.usedLens) {
    return {
      ...result,
      demoReason: result.demoReason
        ? `${result.demoReason} Reverse image search returned no web matches — add SERPAPI_KEY to backend/.env for live source lookup.`
        : "Reverse image search returned no web matches — add SERPAPI_KEY to backend/.env for live source lookup.",
    };
  }

  return result;
}
