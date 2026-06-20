import { useState } from "react";
import ContextTraceTimeline from "../components/contextTrace/ContextTraceTimeline";
import ContextTraceUpload from "../components/contextTrace/ContextTraceUpload";
import ContextTraceVerdictCard from "../components/contextTrace/ContextTraceVerdict";
import ImageDescriptionCard from "../components/contextTrace/ImageDescriptionCard";
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
    <div className="nt-screen">
      {/* Hero kicker */}
      <header className="relative">
        <p className="nt-kicker nt-kicker--news">Evidence story</p>
        <h1 className="nt-h1 mt-1">
          Context <span className="nt-gradient-text">Trace</span>
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-body">
          Detect image context manipulation by tracing how old media gets reused to support
          misleading modern claims.
        </p>
        {analysis?.demoMode && (
          <span
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide"
            style={{ background: "var(--color-yellow-soft)", color: "#a87a14" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-yellow-deep)" }}
              aria-hidden
            />
            Demo Mode
          </span>
        )}
      </header>

      <ContextTraceUpload
        previewUrl={previewUrl}
        fileName={analysis?.fileName ?? null}
        loading={loading}
        onFileSelect={handleUpload}
        onUrlSubmit={handleUrlSubmit}
      />

      {loading && (
        <div className="nt-card flex flex-col items-center gap-4 p-8 text-center">
          <span className="nt-spinner" aria-hidden />
          <div>
            <p className="text-sm font-extrabold text-ink">Tracing context…</p>
            <p className="mt-1 text-xs leading-relaxed text-body">
              Fetching image, running reverse image search, and mapping its narrative.
            </p>
          </div>
          <span className="nt-dots text-blue" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="nt-card flex items-start gap-3 p-4"
          style={{ background: "var(--color-pink-soft)", borderColor: "rgba(255,123,162,0.45)" }}
        >
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "var(--grad-pink)" }}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v3.75m0 3.75h.008M12 3l9 15.75H3L12 3z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-extrabold text-ink">Couldn&apos;t trace that</p>
            <p className="mt-0.5 text-xs leading-relaxed text-body">{error}</p>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <>
          {analysis.demoMode && analysis.demoReason && (
            <p
              className="rounded-3xl px-4 py-3 text-xs leading-relaxed"
              style={{ background: "var(--color-yellow-soft)", color: "#a87a14" }}
            >
              {analysis.demoReason}
            </p>
          )}

          <ImageDescriptionCard description={analysis.imageDescription} />

          <ContextTraceTimeline
            appearances={analysis.timeline}
            previewUrl={analysis.previewDataUrl}
          />

          <NarrativeComparison
            originalContext={analysis.originalContext}
            currentClaim={analysis.currentClaim}
          />

          <NarrativeDriftGauge
            score={analysis.narrativeDriftScore}
            band={analysis.narrativeDriftBand}
            label={analysis.narrativeDriftLabel}
            manipulationRisk={analysis.verdict.manipulationRisk}
          />

          <ContextTraceVerdictCard verdict={analysis.verdict} exif={analysis.exif} />
        </>
      )}
    </div>
  );
}
