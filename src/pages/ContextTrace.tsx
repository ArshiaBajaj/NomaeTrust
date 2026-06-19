import { useState } from "react";
import ContextTraceTimeline from "../components/contextTrace/ContextTraceTimeline";
import ContextTraceUpload from "../components/contextTrace/ContextTraceUpload";
import ContextTraceVerdictCard from "../components/contextTrace/ContextTraceVerdict";
import ImageDescriptionCard from "../components/contextTrace/ImageDescriptionCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import NarrativeComparison from "../components/contextTrace/NarrativeComparison";
import NarrativeDriftGauge from "../components/contextTrace/NarrativeDriftGauge";
import { analyzeContextTraceImage, analyzeContextTraceUrl } from "../services/contextTraceApi";
import type { ContextTraceAnalysis } from "../types/contextTrace";

export default function ContextTrace() {
  const [analysis, setAnalysis] = useState<ContextTraceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (task: () => Promise<ContextTraceAnalysis>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await task();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (file: File) => {
    void runAnalysis(() => analyzeContextTraceImage(file));
  };

  const handleUrlSubmit = (url: string) => {
    void runAnalysis(() => analyzeContextTraceUrl(url));
  };

  const previewUrl = analysis?.previewDataUrl ?? null;

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader
        title="Context Trace"
        description="Detect image context manipulation by tracing how old media is reused to support misleading modern claims."
      />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
        {analysis?.demoMode && (
          <div className="mb-6 flex justify-end">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-800">
              Demo Mode
            </span>
          </div>
        )}

        <div className="space-y-8">
          <ContextTraceUpload
            previewUrl={previewUrl}
            fileName={analysis?.fileName ?? null}
            loading={loading}
            onFileSelect={handleUpload}
            onUrlSubmit={handleUrlSubmit}
          />

          {loading && (
            <LoadingSpinner label="Fetching image, running reverse image search, and tracing context…" />
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
            >
              {error}
            </div>
          )}

          {analysis && !loading && (
            <>
              {analysis.demoMode && analysis.demoReason && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-900">
                  {analysis.demoReason}
                </p>
              )}

              <ImageDescriptionCard description={analysis.imageDescription} />

              <ContextTraceTimeline
                appearances={analysis.timeline}
                previewUrl={analysis.previewDataUrl}
              />

              <NarrativeDriftGauge
                score={analysis.narrativeDriftScore}
                band={analysis.narrativeDriftBand}
                label={analysis.narrativeDriftLabel}
                manipulationRisk={analysis.verdict.manipulationRisk}
              />

              <NarrativeComparison
                originalContext={analysis.originalContext}
                currentClaim={analysis.currentClaim}
              />

              <ContextTraceVerdictCard verdict={analysis.verdict} exif={analysis.exif} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
