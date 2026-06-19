import type { DetectiveChallenge } from "./detectiveChallenges";

const SDFVD_PAIRS = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"] as const;

function buildSdfvdChallenges(): DetectiveChallenge[] {
  const challenges: DetectiveChallenge[] = [];

  for (const pairId of SDFVD_PAIRS) {
    challenges.push({
      id: `sdfvd-real-${pairId}`,
      mediaType: "video",
      videoUrl: `/assets/detective/clips/sdfvd-real-${pairId}.mp4`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1586339949911-93e4750d4dda?w=800&q=80",
      mediaLabel: "Stock footage (real)",
      category: "News",
      sourceContext: `SDFVD · Pexels stock · pair ${pairId}`,
      prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
      isManipulated: false,
      hiveVerdict: "No manipulation detected",
      confidence: 95,
      explanation:
        "Natural head motion and lighting match unaltered stock footage from the SDFVD real set.",
      highlightRegion: "eyes",
      artifactLabel: "Authentic capture",
    });

    challenges.push({
      id: `sdfvd-fake-${pairId}`,
      mediaType: "video",
      videoUrl: `/assets/detective/clips/sdfvd-fake-${pairId}.mp4`,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
      mediaLabel: "Face-swap deepfake",
      category: "Social",
      sourceContext: `SDFVD · Remaker AI face swap · pair ${pairId}`,
      prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
      isManipulated: true,
      hiveVerdict: "Deepfake detected",
      confidence: 91,
      explanation:
        "Face-swap boundaries and skin texture blending differ from the authentic Pexels source clip in this pair.",
      highlightRegion: "mouth",
      artifactLabel: "Face-swap seam",
    });
  }

  return challenges;
}

export const LOCAL_VIDEO_CHALLENGES = buildSdfvdChallenges();

async function hasImportedClips(): Promise<boolean> {
  const probeUrl = "/assets/detective/clips/sdfvd-real-v1.mp4";
  try {
    let res = await fetch(probeUrl, { method: "HEAD" });
    if (res.ok) return true;
    res = await fetch(probeUrl, { headers: { Range: "bytes=0-1" } });
    return res.ok || res.status === 206;
  } catch {
    return false;
  }
}

/** Use local public clips when import script has run (no backend required). */
export async function loadLocalVideoDeck(): Promise<DetectiveChallenge[]> {
  if (!(await hasImportedClips())) return [];
  return LOCAL_VIDEO_CHALLENGES;
}
