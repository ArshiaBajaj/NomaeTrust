import type { DetectiveChallenge } from "../data/detectiveChallenges";
import { DETECTIVE_CHALLENGES, shuffleChallenges } from "../data/detectiveChallenges";
import { loadLocalVideoDeck } from "../data/detectiveVideoClips";

export type { DetectiveChallenge };

export type DetectiveSetup = {
  ready: boolean;
  installedClips?: number;
  importCommand?: string;
};

type ChallengesResponse = {
  challenges: DetectiveChallenge[];
  setup?: { sdfvd?: { ready: boolean; installedClips: number; importCommand: string } };
};

/** Video deck from local public clips and/or backend API. Works without backend if clips exist. */
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchDetectiveChallenges(): Promise<{
  deck: DetectiveChallenge[];
  setup?: DetectiveSetup;
}> {
  const localVideos = await loadLocalVideoDeck();
  if (localVideos.length >= 4) {
    return {
      deck: shuffleChallenges(localVideos),
      setup: {
        ready: true,
        installedClips: localVideos.length,
        importCommand: "npm run detective:import-sdfvd",
      },
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/detective/challenges`);
    if (!res.ok) throw new Error("API unavailable");
    const data = (await res.json()) as ChallengesResponse;
    const apiVideos = (data.challenges ?? []).filter((c) => Boolean(c.videoUrl));

    if (apiVideos.length >= 4) {
      return {
        deck: shuffleChallenges(apiVideos),
        setup: data.setup?.sdfvd,
      };
    }
  } catch {
    /* backend optional */
  }

  return { deck: shuffleChallenges(DETECTIVE_CHALLENGES), setup: { ready: false } };
}
