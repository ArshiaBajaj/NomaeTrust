import OpenAI, { toFile } from "openai";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add your key to backend/.env",
    );
  }
  return new OpenAI({ apiKey });
}

export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const openai = getOpenAIClient();
  const file = await toFile(buffer, filename);

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
    response_format: "text",
  });

  if (typeof response === "string") {
    return response.trim();
  }

  return String(response).trim();
}
