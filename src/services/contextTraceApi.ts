import type { ContextTraceAnalysis } from "../types/contextTrace";
import { CONTEXT_TRACE_DEMO } from "../data/contextTraceDemo";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function analyzeContextTraceImage(file: File): Promise<ContextTraceAnalysis> {
  const form = new FormData();
  form.append("image", file);

  try {
    const res = await fetch(`${API_BASE}/api/context-trace/analyze`, {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      return res.json() as Promise<ContextTraceAnalysis>;
    }
  } catch {
    // Network error — fall through to local demo
  }

  return buildLocalDemoAnalysis(
    file,
    "Could not reach the analysis server — showing curated demo trace with your uploaded preview.",
  );
}

async function buildLocalDemoAnalysis(
  file: File,
  demoReason: string,
): Promise<ContextTraceAnalysis> {
  const previewDataUrl = await readFileAsDataUrl(file);
  return {
    ...CONTEXT_TRACE_DEMO,
    previewDataUrl,
    fileName: file.name,
    demoMode: true,
    demoReason,
    timeline: CONTEXT_TRACE_DEMO.timeline.map((entry, index) => ({
      ...entry,
      imageUrl: index === 0 ? previewDataUrl : entry.imageUrl,
    })),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

export function getDriftBandLabel(score: number): string {
  if (score >= 70) return "High Context Manipulation Risk";
  if (score >= 35) return "Moderate Context Drift";
  return "Low Context Drift";
}
