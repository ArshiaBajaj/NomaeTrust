import {
  getOpenAIClient,
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "../openaiClient.js";
import type { ExtractedExif } from "./exifMetadata.js";
import type { LensMatch } from "./googleLens.js";

export type SynthesizedProvenance = {
  events: Array<{
    year: number;
    label: string;
    headline: string;
    source: string;
    metadata: {
      gps: string;
      captured: string;
      published: string;
      device?: string;
    };
  }>;
  metadataDiscrepancies: Array<{
    field: string;
    original: string;
    current: string;
  }>;
  narrativeDelta: string;
  shareSummary: string;
  timelineMinYear: number;
  timelineMaxYear: number;
};

type SynthesisInput = {
  imageDataUrl: string;
  submittedUrl: string;
  resolvedUrl: string;
  exif: ExtractedExif | null;
  webMatches: LensMatch[];
  currentYear: number;
  reverseImageQuery?: string;
  reverseImageTotalResults?: number;
};

const SYNTHESIS_SCHEMA = `{
  "events": [
    {
      "year": number,
      "label": "The Truth: Original Context" | "The Rumor: Mutated Narrative" | string,
      "headline": string,
      "source": string,
      "metadata": { "gps": string, "captured": string, "published": string, "device": string }
    }
  ],
  "metadataDiscrepancies": [{ "field": string, "original": string, "current": string }],
  "narrativeDelta": string,
  "shareSummary": string,
  "timelineMinYear": number,
  "timelineMaxYear": number
}`;

export async function synthesizeProvenance(
  input: SynthesisInput,
): Promise<SynthesizedProvenance> {
  const exifBlock = input.exif
    ? JSON.stringify(input.exif, null, 2)
    : "No EXIF metadata found in the image file.";

  const matchesBlock =
    input.webMatches.length > 0
      ? input.webMatches
          .map(
            (m, i) =>
              `${i + 1}. ${m.title} — ${m.link}${m.source ? ` (${m.source})` : ""}${m.date ? ` [${m.date}]` : ""}`,
          )
          .join("\n")
      : "No Google Lens web matches returned. Base analysis on EXIF and visible image content only.";

  const prompt = `You are ContextLens, a content provenance analyst for misinformation defense.

Analyze this image and build a provenance timeline comparing the EARLIEST credible original context vs the CURRENT viral/misleading use.

Submitted URL: ${input.submittedUrl}
Resolved image URL: ${input.resolvedUrl}
Current year: ${input.currentYear}
Google reverse image subject guess: ${input.reverseImageQuery ?? "n/a"}
Reverse image hit count: ${input.reverseImageTotalResults ?? input.webMatches.length}

EXIF from downloaded file:
${exifBlock}

Google Lens / web visual matches (earlier listings are often older originals):
${matchesBlock}

Rules:
- Return exactly 2 events when possible: oldest original context (left/truth) and current misleading reuse (right/rumor).
- Use web match titles/links for headlines and sources when available. Do not invent news outlets.
- If EXIF is missing on current use, say metadata was stripped — do not claim FALSE.
- narrativeDelta: 1-2 sentences explaining how context changed (dates, location, event type).
- shareSummary: one paragraph families can forward.
- metadataDiscrepancies: compare original vs current for GPS, Captured, Published, Device.
- timelineMinYear/timelineMaxYear: span the two events.
- If uncertain, use cautious language ("appears", "likely reused") — no binary "FAKE" labels.

Respond with ONLY valid JSON matching:
${SYNTHESIS_SCHEMA}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: input.imageDataUrl } },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty provenance synthesis");

    const parsed = JSON.parse(raw) as SynthesizedProvenance;
    if (!parsed.events?.length || !parsed.narrativeDelta) {
      throw new Error("Invalid provenance synthesis shape");
    }

    return parsed;
  } catch (error) {
    logOpenAIError("context lens synthesis", error);
    if (shouldFallbackToDemoMode(error)) {
      return buildFallbackSynthesis(input);
    }
    throw error;
  }
}

function buildFallbackSynthesis(input: SynthesisInput): SynthesizedProvenance {
  const oldest = input.webMatches[0];
  const newest = input.webMatches[input.webMatches.length - 1];
  const exif = input.exif;
  const years = input.webMatches
    .map((m) => Number(m.date?.slice(0, 4)))
    .filter((y) => y >= 1990 && y <= input.currentYear);
  const minYear = years.length
    ? Math.min(...years)
    : input.currentYear - 8;

  return {
    timelineMinYear: minYear,
    timelineMaxYear: input.currentYear,
    narrativeDelta:
      "This image may have been reused with different context. EXIF and web match data suggest comparing the original publication to how it is being shared now.",
    shareSummary: `ContextLens: Image from ${input.resolvedUrl} — compare original source (${oldest?.title ?? "unknown"}) vs current share before trusting urgent claims.`,
    events: [
      {
        year: minYear,
        label: "The Truth: Original Context",
        headline: oldest?.title ?? "Earlier publication of this image",
        source: oldest?.source ?? oldest?.link ?? "Web archive / news source",
        metadata: {
          gps: exif?.gps ?? "See original publication",
          captured: exif?.captured ?? "Earlier date",
          published: oldest?.date ?? exif?.published ?? "Original publish date unknown",
          device: exif?.device,
        },
      },
      {
        year: input.currentYear,
        label: "The Rumor: Mutated Narrative",
        headline: newest?.title ?? "Current viral repost",
        source: newest?.source ?? input.submittedUrl,
        metadata: {
          gps: exif ? exif.gps : "Not embedded — likely stripped",
          captured: exif ? exif.captured : "Unknown — EXIF removed",
          published: `${input.currentYear} — shared via submitted URL`,
          device: "Re-upload / screenshot",
        },
      },
    ],
    metadataDiscrepancies: [
      {
        field: "GPS",
        original: exif?.gps ?? "From original file",
        current: exif ? exif.gps : "Stripped or missing",
      },
      {
        field: "Captured",
        original: exif?.captured ?? "Earlier capture",
        current: "Unknown on re-upload",
      },
      {
        field: "Published",
        original: oldest?.date ?? exif?.published ?? "Original date",
        current: `${input.currentYear} — current share`,
      },
      {
        field: "Device",
        original: exif?.device ?? "Original camera",
        current: "Screenshot re-upload",
      },
    ],
  };
}
