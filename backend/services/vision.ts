import {
  getOpenAIClient,
  logOpenAIError,
  shouldFallbackToDemoMode,
} from "./openaiClient.js";

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string,
): Promise<{ text: string; confidence: number }> {
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  try {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all visible text from this screenshot or image. Return only the extracted text, preserving line breaks. If no text, return [NO TEXT FOUND].",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    if (!text || text === "[NO TEXT FOUND]") {
      throw new Error("No text extracted from image");
    }

    return { text, confidence: 0.88 };
  } catch (error) {
    logOpenAIError("image OCR", error);
    if (shouldFallbackToDemoMode(error)) {
      return {
        text: `BREAKING: City water supply contaminated with bacteria.
Residents advised to boil all water immediately.
Officials confirm outbreak in downtown Atlanta district.
Share this with everyone — schools closing tomorrow.`,
        confidence: 0.85,
      };
    }
    throw error;
  }
}
