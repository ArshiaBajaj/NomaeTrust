import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FF_CLIP_SPECS,
  FF_DATASET_FORM_URL,
  FF_REPO_URL,
  type FfClipSpec,
  type FfManipulation,
} from "./faceForensicsPairs.js";
import {
  SDFVD_CLIP_SPECS,
  SDFVD_HF_URL,
  type SdfvdClipSpec,
} from "./sdfvdClips.js";

export type DetectiveClipSource = {
  id: string;
  dataset: "faceforensics++" | "sdfvd";
  label: "real" | "fake";
  clipPath?: string;
  thumbnailPath: string;
  method?: FfManipulation | "FaceSwap" | "authentic";
  notes: string;
};

export type DetectiveChallengePayload = {
  id: string;
  mediaType: "video" | "image";
  videoUrl?: string;
  thumbnailUrl: string;
  mediaLabel: string;
  category: string;
  sourceContext: string;
  prompt: string;
  isManipulated: boolean;
  hiveVerdict: string;
  confidence: number;
  explanation: string;
  highlightRegion: "eyes" | "mouth" | "audio" | "lighting";
  artifactLabel: string;
  dataset?: string;
  manipulationMethod?: string;
  ffSequenceId?: string;
  ffPair?: [string, string];
};

const CLIPS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public/assets/detective/clips",
);
const THUMBS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public/assets/detective/thumbs",
);

function clipExists(filename: string): boolean {
  return fs.existsSync(path.join(CLIPS_DIR, filename));
}

function clipUrl(filename?: string): string | undefined {
  if (!filename || !clipExists(filename)) return undefined;
  return `/assets/detective/clips/${filename}`;
}

function thumbUrl(filename: string): string {
  const local = path.join(THUMBS_DIR, filename);
  if (fs.existsSync(local)) return `/assets/detective/thumbs/${filename}`;
  return "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80";
}

function ffExplanation(method: FfManipulation | "authentic"): string {
  switch (method) {
    case "Deepfakes":
      return "Neural face synthesis artifacts detected in blink cadence and lip boundary blending.";
    case "Face2Face":
      return "Facial expressions were re-rendered onto the target; micro-expression timing differs from natural muscle activation.";
    case "FaceSwap":
      return "Identity swap boundaries show subtle skin-texture seams at the jaw and hairline.";
    case "NeuralTextures":
      return "GAN-based neural texture manipulation altered mouth region pixels.";
    default:
      return "Natural blink rhythm, consistent lighting, and stable facial geometry match an unaltered source recording.";
  }
}

function highlightFor(
  method: FfManipulation | "FaceSwap" | "authentic",
): "eyes" | "mouth" | "audio" | "lighting" {
  if (method === "authentic") return "eyes";
  if (method === "Deepfakes") return "eyes";
  return "mouth";
}

function ffSpecToChallenge(spec: FfClipSpec): DetectiveChallengePayload | null {
  const videoUrl = clipUrl(spec.clipFile);
  if (!videoUrl) return null;

  const isFake = spec.label === "fake";
  const method = spec.method ?? "authentic";

  return {
    id: spec.id,
    mediaType: "video",
    videoUrl,
    thumbnailUrl: thumbUrl(spec.thumbFile),
    mediaLabel: isFake ? `${method} manipulation` : "Original FF++ sequence",
    category: isFake ? "Politics" : "News",
    sourceContext: isFake
      ? `FaceForensics++ · ${method} · seq ${spec.sequenceId}`
      : `FaceForensics++ · authentic · seq ${spec.sequenceId}`,
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: isFake,
    hiveVerdict: isFake ? "Deepfake detected" : "No manipulation detected",
    confidence: isFake ? 94 : 96,
    explanation: ffExplanation(method),
    highlightRegion: highlightFor(method),
    artifactLabel: isFake ? `${method} artifact` : "Authentic capture",
    dataset: "faceforensics++",
    manipulationMethod: method,
    ffSequenceId: spec.sequenceId,
    ffPair: spec.pair,
  };
}

function sdfvdSpecToChallenge(spec: SdfvdClipSpec): DetectiveChallengePayload | null {
  const videoUrl = clipUrl(spec.clipFile);
  if (!videoUrl) return null;

  const isFake = spec.label === "fake";

  return {
    id: spec.id,
    mediaType: "video",
    videoUrl,
    thumbnailUrl: thumbUrl(spec.thumbFile),
    mediaLabel: isFake ? "Face-swap deepfake" : "Stock footage (real)",
    category: isFake ? "Social" : "News",
    sourceContext: isFake
      ? `SDFVD · Remaker AI face swap · pair ${spec.pairId}`
      : `SDFVD · Pexels stock · pair ${spec.pairId}`,
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: isFake,
    hiveVerdict: isFake ? "Deepfake detected" : "No manipulation detected",
    confidence: isFake ? 91 : 95,
    explanation: isFake
      ? "Face-swap boundaries and skin texture blending differ from the authentic Pexels source clip in this pair."
      : "Natural head motion and lighting match unaltered stock footage from the SDFVD real set.",
    highlightRegion: isFake ? "mouth" : "eyes",
    artifactLabel: isFake ? "Face-swap seam" : "Authentic capture",
    dataset: "sdfvd",
    manipulationMethod: isFake ? "FaceSwap" : "authentic",
  };
}

export function getDetectiveSetupStatus() {
  const ffExpected = FF_CLIP_SPECS.map((s) => s.clipFile);
  const ffInstalled = ffExpected.filter((f) => clipExists(f));

  const sdfvdExpected = SDFVD_CLIP_SPECS.map((s) => s.clipFile);
  const sdfvdInstalled = sdfvdExpected.filter((f) => clipExists(f));

  return {
    clipsDir: "public/assets/detective/clips",
    ready: ffInstalled.length >= 4 || sdfvdInstalled.length >= 4,
    faceForensics: {
      repo: FF_REPO_URL,
      accessForm: FF_DATASET_FORM_URL,
      importCommand: "npm run detective:import-ff++ -- /path/to/FaceForensics++",
      downloadHint:
        "python download-FaceForensics.py <output> -d all -c c23 -t videos --num_videos 20",
      expectedClips: ffExpected.length,
      installedClips: ffInstalled.length,
      ready: ffInstalled.length >= 4,
    },
    sdfvd: {
      repo: SDFVD_HF_URL,
      license: "CC-BY-4.0",
      importCommand: "npm run detective:import-sdfvd",
      note: "Easiest path — no form, ~15MB for 10 real/fake pairs",
      expectedClips: sdfvdExpected.length,
      installedClips: sdfvdInstalled.length,
      ready: sdfvdInstalled.length >= 4,
    },
  };
}

/** @deprecated use getDetectiveSetupStatus */
export function getFaceForensicsSetupStatus() {
  return getDetectiveSetupStatus().faceForensics;
}

export const DETECTIVE_CLIP_MANIFEST: DetectiveClipSource[] = [
  ...FF_CLIP_SPECS.map((spec) => ({
    id: spec.id,
    dataset: "faceforensics++" as const,
    label: spec.label,
    clipPath: spec.clipFile,
    thumbnailPath: `/assets/detective/thumbs/${spec.thumbFile}`,
    method: spec.method ?? ("authentic" as const),
    notes: `FF++ seq ${spec.sequenceId}`,
  })),
  ...SDFVD_CLIP_SPECS.map((spec) => ({
    id: spec.id,
    dataset: "sdfvd" as const,
    label: spec.label,
    clipPath: spec.clipFile,
    thumbnailPath: `/assets/detective/thumbs/${spec.thumbFile}`,
    method: spec.label === "fake" ? ("FaceSwap" as const) : ("authentic" as const),
    notes: `SDFVD pair ${spec.pairId}`,
  })),
];

export function buildDetectiveChallengeDeck(): DetectiveChallengePayload[] {
  const sdfvd = SDFVD_CLIP_SPECS.map(sdfvdSpecToChallenge).filter(
    (c): c is DetectiveChallengePayload => c !== null,
  );
  if (sdfvd.length >= 4) return sdfvd;

  const ff = FF_CLIP_SPECS.map(ffSpecToChallenge).filter(
    (c): c is DetectiveChallengePayload => c !== null,
  );
  if (ff.length >= 4) return ff;

  return [];
}
