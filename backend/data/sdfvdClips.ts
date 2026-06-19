/**
 * SDFVD — Small-scale Deepfake Forgery Video Dataset
 * @see https://huggingface.co/datasets/Hemgg/SDFVD-video-dataset
 * @see https://data.mendeley.com/datasets/bcmkfgct2s (CC-BY-4.0)
 *
 * 106 clips · ~183MB · no access form · already 4–5s @ 720p
 * Real = Pexels stock · Fake = Remaker AI face swap
 */

export type SdfvdClipSpec = {
  id: string;
  label: "real" | "fake";
  clipFile: string;
  thumbFile: string;
  pairId: string;
};

export const SDFVD_HF_REPO = "Hemgg/SDFVD-video-dataset";
export const SDFVD_HF_URL = "https://huggingface.co/datasets/Hemgg/SDFVD-video-dataset";

/** Paired real/fake clips — same index = same scene, fake is face-swapped version. */
export const SDFVD_PAIR_IDS = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

export function buildSdfvdClipSpecs(limit = 10): SdfvdClipSpec[] {
  const specs: SdfvdClipSpec[] = [];
  for (const pairId of SDFVD_PAIR_IDS.slice(0, limit)) {
    specs.push(
      {
        id: `sdfvd-real-${pairId}`,
        label: "real",
        clipFile: `sdfvd-real-${pairId}.mp4`,
        thumbFile: `sdfvd-real-${pairId}.jpg`,
        pairId,
      },
      {
        id: `sdfvd-fake-${pairId}`,
        label: "fake",
        clipFile: `sdfvd-fake-${pairId}.mp4`,
        thumbFile: `sdfvd-fake-${pairId}.jpg`,
        pairId,
      },
    );
  }
  return specs;
}

export const SDFVD_CLIP_SPECS = buildSdfvdClipSpecs();

export function sdfvdHfDownloadUrl(folder: "Real" | "Fake", pairId: string): string {
  const fileId = folder === "Fake" ? `vs${pairId.replace(/^v/, "")}` : pairId;
  return `https://huggingface.co/datasets/${SDFVD_HF_REPO}/resolve/main/${folder}/${fileId}.mp4`;
}
