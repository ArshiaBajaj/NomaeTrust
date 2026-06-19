const HIVE_SYNC_URL = "https://api.thehive.ai/api/v2/task/sync";

export type HiveVideoScore = {
  available: boolean;
  deepfakeScore: number;
  isDeepfake: boolean;
  confidence: number;
  verdict: string;
};

export async function scoreVideoWithHive(videoUrl: string): Promise<HiveVideoScore | null> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey || apiKey === "your_hive_api_key_here") return null;

  try {
    const response = await fetch(HIVE_SYNC_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: videoUrl,
        models: ["deepfake"],
      }),
    });

    if (!response.ok) {
      console.error("[Detective/Hive] API error:", response.status);
      return null;
    }

    const data = (await response.json()) as {
      status?: Array<{
        response?: {
          output?: Array<{
            classes?: Array<{ class: string; score: number }>;
          }>;
        };
      }>;
    };

    const classes =
      data.status?.[0]?.response?.output?.[0]?.classes ??
      data.status?.[0]?.response?.output?.flatMap((o) => o.classes ?? []) ??
      [];

    const deepfakeClass = classes.find((c) =>
      /deepfake|yes_deepfake|ai/i.test(c.class),
    );
    const score = deepfakeClass?.score ?? 0;
    const isDeepfake = score >= 0.5;

    return {
      available: true,
      deepfakeScore: score,
      isDeepfake,
      confidence: Math.round(Math.max(score, 1 - score) * 1000) / 10,
      verdict: isDeepfake ? "Deepfake detected" : "No manipulation detected",
    };
  } catch (error) {
    console.error("[Detective/Hive] request failed:", error);
    return null;
  }
}
