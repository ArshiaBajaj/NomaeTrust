import type { ContextLensAnalysis } from "../types/contextLens";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function analyzeImageUrl(imageUrl: string): Promise<ContextLensAnalysis> {
  const res = await fetch(`${API_BASE}/api/context-lens/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to analyze image URL");
  }

  return data as ContextLensAnalysis;
}

export async function analyzeImageUpload(file: File): Promise<ContextLensAnalysis> {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${API_BASE}/api/context-lens/analyze-upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to analyze uploaded image");
  }

  return data as ContextLensAnalysis;
}

export async function fetchTrackedDeepfakes(): Promise<
  Array<{
    id: string;
    imageUrl: string;
    submittedAt: string;
    assessment: ContextLensAnalysis["deepfake"];
  }>
> {
  const res = await fetch(`${API_BASE}/api/context-lens/tracked`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.reports ?? [];
}
