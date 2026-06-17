import {
  getOpenAIClient,
  logOpenAIError,
} from "./openaiClient.js";

export type ClaimExtractionResult = {
  claim: string;
  confidence: number;
  status: string;
};

export async function extractClaim(
  transcript: string,
): Promise<ClaimExtractionResult> {
  console.log(
    `[Claims] Extracting claim from transcript (${transcript.length} chars)`,
  );

  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract factual claims from transcripts for a trust verification platform. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: `Extract the primary factual claim from this transcript and return a confidence score.

Transcript:
"""
${transcript}
"""

Return JSON with exactly these fields:
- "claim": the primary factual claim as a single clear sentence
- "confidence": number from 0 to 1 indicating how confident you are in the extraction
- "status": one of "verified", "unverified", "disputed", or "pending" based on how verifiable the claim appears`,
        },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("GPT-4o-mini returned an empty response");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content) as Record<string, unknown>;
    } catch {
      throw new Error("Failed to parse claim extraction response");
    }

    const claim = typeof parsed.claim === "string" ? parsed.claim.trim() : "";
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0;
    const status =
      typeof parsed.status === "string" ? parsed.status : "pending";

    if (!claim) {
      throw new Error("No claim could be extracted from the transcript");
    }

    console.log(
      `[Claims] Extracted claim status="${status}" confidence=${confidence}`,
    );

    return { claim, confidence, status };
  } catch (error) {
    logOpenAIError("GPT-4o-mini claim extraction", error);
    throw error;
  }
}
