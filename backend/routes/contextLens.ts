import { Router } from "express";
import multer from "multer";
import { exifToDisplay, extractExifMetadata } from "../services/contextLens/exifMetadata.js";
import { analyzeDeepfakeRisk } from "../services/contextLens/deepfakeDetection.js";
import {
  buildGoogleLensUrl,
  fetchImageBuffer,
  resolveImageUrl,
} from "../services/contextLens/imageFetch.js";
import { searchImageProvenance } from "../services/contextLens/googleLens.js";
import { synthesizeProvenance } from "../services/contextLens/synthesizeProvenance.js";
import {
  buildMapClaimText,
  getDeepfakeReports,
  trackDeepfakeReport,
} from "../store/deepfakeStore.js";
import { addClaim } from "../store/mapStore.js";
import { resolveClaimLocation } from "../services/claimGeolocation.js";
import { toUserFacingOpenAIError } from "../services/openaiClient.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = Router();

async function runContextLensPipeline(imageUrl: string, buffer: Buffer, mimeType: string, finalUrl: string) {
  const previewDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const exif = await extractExifMetadata(buffer);
  const exifDisplay = exifToDisplay(exif);

  const lensUrl = buildGoogleLensUrl(finalUrl);
  const provenanceSearch = await searchImageProvenance(finalUrl);
  const webMatches = provenanceSearch.matches;

  const synthesis = await synthesizeProvenance({
    imageDataUrl: previewDataUrl,
    submittedUrl: imageUrl,
    resolvedUrl: finalUrl,
    exif,
    webMatches,
    currentYear: new Date().getFullYear(),
    reverseImageQuery: provenanceSearch.queryDisplayed,
    reverseImageTotalResults: provenanceSearch.totalResults,
  });

  const hasProvenanceMismatch = synthesis.metadataDiscrepancies.some(
    (d) => d.original !== d.current,
  );

  const deepfake = await analyzeDeepfakeRisk({
    imageDataUrl: previewDataUrl,
    exifFound: Boolean(exif),
    hasProvenanceMismatch,
    narrativeDelta: synthesis.narrativeDelta,
  });

  const events = synthesis.events.map((event, index) => ({
    ...event,
    imageUrl:
      index === 0
        ? webMatches[0]?.thumbnail ?? previewDataUrl
        : webMatches[webMatches.length - 1]?.thumbnail ?? previewDataUrl,
    thumbnailVariant: index === 0 ? ("flood" as const) : ("protest" as const),
  }));

  if (events.length === 1) {
    events.push({
      year: new Date().getFullYear(),
      label: "The Rumor: Mutated Narrative",
      headline: "Current share — context may differ from original",
      source: imageUrl,
      metadata: exifDisplay,
      imageUrl: previewDataUrl,
      thumbnailVariant: "protest",
    });
  }

  let trackedReportId: string | null = null;
  if (deepfake.tracked) {
    const report = trackDeepfakeReport({
      imageUrl,
      resolvedUrl: finalUrl,
      assessment: deepfake,
      narrativeDelta: synthesis.narrativeDelta,
    });
    trackedReportId = report?.id ?? null;

    addClaim({
      text: buildMapClaimText(deepfake, synthesis.narrativeDelta),
      source: "deepfake",
      confidence: deepfake.confidence,
      status: "disputed",
      urgentReview: true,
      category: "Synthetic Media",
      location: resolveClaimLocation(
        synthesis.narrativeDelta,
        [],
        `deepfake-${Date.now()}`,
      ),
    });
  }

  return {
    imageUrl,
    resolvedUrl: finalUrl,
    previewDataUrl,
    exifFound: Boolean(exif),
    events,
    metadataDiscrepancies: synthesis.metadataDiscrepancies,
    narrativeDelta: synthesis.narrativeDelta,
    shareSummary: `${synthesis.shareSummary} Deepfake risk: ${Math.round(deepfake.deepfakeRiskScore * 100)}% (${deepfake.riskBand}).`,
    timelineMinYear: synthesis.timelineMinYear,
    timelineMaxYear: synthesis.timelineMaxYear,
    webMatches,
    googleLensUrl: lensUrl,
    usedGoogleLens: provenanceSearch.usedReverseImage || provenanceSearch.usedLens,
    reverseImageQuery: provenanceSearch.queryDisplayed,
    reverseImageTotalResults: provenanceSearch.totalResults,
    serpApiConfigured: Boolean(
      process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== "your_serpapi_key_here",
    ),
    exif: exifDisplay,
    deepfake,
    trackedReportId,
    syncedToMap: deepfake.tracked,
  };
}

router.get("/context-lens/tracked", (_req, res) => {
  res.json({ reports: getDeepfakeReports() });
});

router.post("/context-lens/analyze", async (req, res) => {
  const { imageUrl } = req.body as { imageUrl?: string };

  if (!imageUrl?.trim()) {
    res.status(400).json({ error: "imageUrl is required" });
    return;
  }

  try {
    const resolvedUrl = resolveImageUrl(imageUrl.trim());
    const { buffer, mimeType, finalUrl } = await fetchImageBuffer(resolvedUrl);
    const result = await runContextLensPipeline(imageUrl.trim(), buffer, mimeType, finalUrl);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && !("status" in error)) {
      res.status(422).json({ error: error.message });
      return;
    }
    const facing = toUserFacingOpenAIError(error);
    res.status(facing.status).json({ error: facing.message });
  }
});

router.post("/context-lens/analyze-upload", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "image file is required" });
    return;
  }

  if (!file.mimetype.startsWith("image/")) {
    res.status(400).json({ error: "Only image files are supported" });
    return;
  }

  try {
    const label = `upload://${file.originalname || "image"}`;
    const result = await runContextLensPipeline(
      label,
      file.buffer,
      file.mimetype,
      label,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof Error && !("status" in error)) {
      res.status(422).json({ error: error.message });
      return;
    }
    const facing = toUserFacingOpenAIError(error);
    res.status(facing.status).json({ error: facing.message });
  }
});

export default router;
