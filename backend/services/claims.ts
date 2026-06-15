import OpenAI from "openai";

export type ClaimExtractionResult = {
  claim: string;
  confidence: number;
  status: string;
};

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add your key to backend/.env",
    );
  }
  return new OpenAI({ apiKey });
}

export async function extractClaim(
  transcript: string,
): Promise<ClaimExtractionResult> {
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

  return { claim, confidence, status };
}
