import { useCallback, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import IntelligenceReportCard from "../components/IntelligenceReportCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import PipelineSteps from "../components/PipelineSteps";
import UploadBox from "../components/UploadBox";
import VerificationResult from "../components/VerificationResult";
import { analyzeAudio } from "../services/analyzeAudio";
import { syncClaimToMap } from "../services/map";
import type { AudioAnalysisResult, EvidenceCard, PipelineStep } from "../types";
import { buildEvidenceCardFromAnalysis } from "../utils/evidenceCardBuilder";

type Mode = "simple" | "advanced";

const PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  { id: "upload", label: "Upload" },
  { id: "transcribe", label: "Transcription" },
  { id: "extract", label: "Claim Extraction" },
  { id: "regional", label: "RAG Retrieval" },
  { id: "evidence", label: "Action Card" },
];

function initialSteps(): PipelineStep[] {
  return PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" as const }));
}

function setStepStatus(
  steps: PipelineStep[],
  activeId: string | null,
  completedIds: string[],
): PipelineStep[] {
  return steps.map((step) => {
    if (completedIds.includes(step.id)) return { ...step, status: "complete" };
    if (step.id === activeId) return { ...step, status: "active" };
    return { ...step, status: "pending" };
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function StressMode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode: Mode =
    searchParams.get("mode") === "advanced" ? "advanced" : "simple";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [card, setCard] = useState<EvidenceCard | null>(null);
  const [syncedToMap, setSyncedToMap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setSearchParams(next === "advanced" ? { mode: "advanced" } : {}, { replace: true });
    setResult(null);
    setCard(null);
    setError(null);
    setSyncedToMap(false);
    setSelectedFile(null);
    setSteps(initialSteps());
  };

  const runAnalysis = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCard(null);
    setSyncedToMap(false);

    try {
      const base = initialSteps();
      if (mode === "advanced") {
        setSteps(setStepStatus(base, "transcribe", ["upload"]));
      }

      const analysisPromise = analyzeAudio(file);
      if (mode === "advanced") {
        await delay(500);
        setSteps(setStepStatus(base, "extract", ["upload", "transcribe"]));
        await delay(500);
        setSteps(setStepStatus(base, "regional", ["upload", "transcribe", "extract"]));
      }

      const analysis = await analysisPromise;

      if (mode === "advanced") {
        await delay(400);
        setSteps(setStepStatus(base, "evidence", ["upload", "transcribe", "extract", "regional"]));
      }

      const evidenceCard = buildEvidenceCardFromAnalysis(analysis, "voice");
      await syncClaimToMap(
        analysis.claim,
        "voice",
        analysis.confidence,
        evidenceCard.urgentReview,
      );
      setSyncedToMap(true);

      if (mode === "advanced") {
        await delay(300);
        setSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "complete" as const })));
      }

      setResult(analysis);
      setCard(evidenceCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze voice note.");
      if (mode === "advanced") {
        setSteps((prev) =>
          prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s)),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const handleSimpleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runAnalysis(file);
  };

  const handleAdvancedFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setCard(null);
    setError(null);
    setSyncedToMap(false);
    setSteps(initialSteps());
  };

  const reset = () => {
    setResult(null);
    setCard(null);
    setError(null);
    setSyncedToMap(false);
    setSelectedFile(null);
    setSteps(initialSteps());
  };

  const simpleUpload = !card && !loading && mode === "simple";
  const showResult = card && result && !loading;

  return (
    <div className={mode === "simple" ? "min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" : "page-shell"}>
      <div className={`mx-auto max-w-3xl px-6 pb-20 ${mode === "simple" ? "pt-28" : "pt-10 lg:px-8"}`}>
        {mode === "advanced" && (
          <PageHeader
            title="Action Cards"
            description="Upload a WhatsApp voice note. We extract the claim, check trusted sources, and tell you what to do next."
          />
        )}

        {mode === "simple" && !showResult && (
          <div className="text-center text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Action Cards
            </p>
            <h1 className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-4xl">
              Is this rumor true?
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Forwarded a scary voice note at 2 a.m.? One tap — we tell you what to do next.
            </p>
          </div>
        )}

        {showResult && mode === "simple" && (
          <div className="mb-8 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Your Action Card
            </p>
            <h1 className="mt-2 font-serif text-2xl font-medium">Here&apos;s what to do</h1>
          </div>
        )}

        <div
          className={`flex rounded-xl border p-1 ${
            mode === "simple" && !showResult
              ? "mt-10 border-slate-700 bg-slate-800/50"
              : "mb-8 border-[rgba(0,0,0,0.08)] bg-surface-raised"
          }`}
        >
          {(["simple", "advanced"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                mode === m
                  ? mode === "simple" && !showResult
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-navy shadow-sm"
                  : mode === "simple" && !showResult
                    ? "text-slate-400 hover:text-white"
                    : "text-text-muted hover:text-navy"
              }`}
            >
              {m === "simple" ? "Simple" : "Advanced"}
            </button>
          ))}
        </div>

        {mode === "advanced" && !showResult && (
          <>
            <div className="card mb-6 p-6">
              <PipelineSteps steps={steps} />
            </div>
            <div className="card p-6">
              <UploadBox
                accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov"
                label="Drop a WhatsApp voice note"
                description="MP3 · WAV · M4A · OGG · WEBM — max 25 MB"
                icon="audio"
                onFileSelect={handleAdvancedFileSelect}
                disabled={loading}
              />
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => selectedFile && runAnalysis(selectedFile)}
                  disabled={!selectedFile || loading}
                  className="btn-primary"
                >
                  {loading ? "Processing…" : "Generate Action Card"}
                </button>
                {selectedFile && !loading && (
                  <p className="text-xs text-text-muted">{selectedFile.name}</p>
                )}
              </div>
            </div>
          </>
        )}

        {simpleUpload && (
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/10 px-6 py-14 text-white transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/15"
            >
              <span className="text-4xl" aria-hidden>
                🎤
              </span>
              <span className="text-lg font-semibold">Tap to upload voice note</span>
              <span className="text-xs text-slate-400">WhatsApp · MP3 · M4A · MP4 video</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov"
              className="hidden"
              onChange={handleSimpleUpload}
            />
            <Link
              to="/call"
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 py-4 text-center text-sm font-semibold text-slate-200"
            >
              Suspicious phone call instead?
            </Link>
          </div>
        )}

        {loading && (
          <div className="mt-12">
            <LoadingSpinner label="Checking rumor against trusted sources…" />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className={`mt-8 rounded-xl border px-4 py-3 text-sm ${
              mode === "simple"
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-secondary/30 bg-secondary/10 text-secondary"
            }`}
          >
            {error}
          </div>
        )}

        {showResult && (
          <div className={mode === "simple" ? "mt-6" : "mt-10"}>
            <VerificationResult
              card={card}
              variant={mode === "simple" ? "dark" : "light"}
              syncedToMap={syncedToMap}
              technicalDetails={
                mode === "advanced" && result ? (
                  <IntelligenceReportCard
                    card={card}
                    result={result}
                    hideActionCard
                  />
                ) : result ? (
                  <div className="card p-5 text-sm text-text-body">
                    <p className="text-xs font-semibold uppercase text-text-muted">Transcript</p>
                    <p className="mt-2 italic">&ldquo;{result.transcript}&rdquo;</p>
                  </div>
                ) : undefined
              }
            />
            <button
              type="button"
              onClick={reset}
              className={`mt-6 text-sm underline ${
                mode === "simple" ? "text-slate-500" : "text-text-muted"
              }`}
            >
              Check another voice note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
