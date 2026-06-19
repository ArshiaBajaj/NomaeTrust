/**
 * FaceForensics++ challenge pairs — aligned with ondyari/FaceForensics train split.
 * @see https://github.com/ondyari/FaceForensics
 * @see dataset/splits/train.json
 *
 * Download (after Google form approval):
 *   python download-FaceForensics.py <output> -d all -c c23 -t videos --num_videos 20
 */

export type FfManipulation =
  | "Deepfakes"
  | "Face2Face"
  | "FaceSwap"
  | "NeuralTextures";

/** First N pairs from train.json — enough for a full swipe session without huge downloads. */
export const FF_TRAIN_PAIRS: Array<[string, string]> = [
  ["071", "054"],
  ["087", "081"],
  ["881", "856"],
  ["187", "234"],
  ["645", "688"],
  ["754", "758"],
  ["811", "920"],
  ["710", "788"],
  ["628", "568"],
  ["312", "021"],
];

export const FF_COMPRESSION = "c23" as const;

export type FfClipSpec = {
  id: string;
  label: "real" | "fake";
  clipFile: string;
  thumbFile: string;
  sequenceId: string;
  pair?: [string, string];
  method?: FfManipulation;
};

/** Relative paths inside a FaceForensics++ root folder. */
export function ffSourceVideoPath(sequenceId: string): string {
  return `original_sequences/youtube/${FF_COMPRESSION}/videos/${sequenceId}.mp4`;
}

export function ffManipulatedVideoPath(
  method: FfManipulation,
  sourceId: string,
  targetId?: string,
): string {
  const folder = `manipulated_sequences/${method}/${FF_COMPRESSION}/videos`;
  if (method === "Deepfakes" || method === "FaceSwap") {
    return `${folder}/${sourceId}_${targetId}.mp4`;
  }
  return `${folder}/${sourceId}.mp4`;
}

function pad(id: string): string {
  return id.padStart(3, "0");
}

/** Clip specs written by scripts/import-faceforensics.mjs into public/assets/detective/clips/ */
export function buildFaceForensicsClipSpecs(limitPairs = 6): FfClipSpec[] {
  const specs: FfClipSpec[] = [];
  const pairs = FF_TRAIN_PAIRS.slice(0, limitPairs);

  for (const [source, target] of pairs) {
    const s = pad(source);
    const t = pad(target);

    specs.push({
      id: `ff-real-${s}`,
      label: "real",
      clipFile: `original-${s}.mp4`,
      thumbFile: `original-${s}.jpg`,
      sequenceId: s,
      method: undefined,
    });

    specs.push({
      id: `ff-deepfakes-${s}_${t}`,
      label: "fake",
      clipFile: `deepfakes-${s}_${t}.mp4`,
      thumbFile: `deepfakes-${s}_${t}.jpg`,
      sequenceId: s,
      pair: [s, t],
      method: "Deepfakes",
    });
  }

  // One clip per manipulation method (same source sequence) for variety
  const [s0, t0] = pairs[0].map(pad) as [string, string];
  const [s1, t1] = pairs[1].map(pad) as [string, string];

  specs.push(
    {
      id: `ff-face2face-${s0}`,
      label: "fake",
      clipFile: `face2face-${s0}.mp4`,
      thumbFile: `face2face-${s0}.jpg`,
      sequenceId: s0,
      pair: [s0, t0],
      method: "Face2Face",
    },
    {
      id: `ff-faceswap-${s0}_${t0}`,
      label: "fake",
      clipFile: `faceswap-${s0}_${t0}.mp4`,
      thumbFile: `faceswap-${s0}_${t0}.jpg`,
      sequenceId: s0,
      pair: [s0, t0],
      method: "FaceSwap",
    },
    {
      id: `ff-neuraltextures-${s1}`,
      label: "fake",
      clipFile: `neuraltextures-${s1}.mp4`,
      thumbFile: `neuraltextures-${s1}.jpg`,
      sequenceId: s1,
      pair: [s1, t1],
      method: "NeuralTextures",
    },
  );

  return specs;
}

export const FF_CLIP_SPECS = buildFaceForensicsClipSpecs();

export const FF_DATASET_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdRRR3L5zAv6tQ_CKxmK4W96tAab_pfBu2EKAgQbeDVhmXagg/viewform";

export const FF_REPO_URL = "https://github.com/ondyari/FaceForensics";
