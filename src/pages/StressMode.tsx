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
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 lg:px-8">
        {(!showResult || mode === "advanced") && (
          <PageHeader
            title={
              mode === "simple" && !showResult
                ? "Is this rumor true?"
                : "Action Cards"
            }
            description={
              mode === "simple" && !showResult
                ? "Forwarded a scary voice note at 2 a.m.? One tap — we tell you what to do next."
                : "Upload a WhatsApp voice note. We extract the claim, check trusted sources, and tell you what to do next."
            }
          />
        )}

        {showResult && mode === "simple" && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Your Action Card
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium text-navy">
              Here&apos;s what to do
            </h1>
          </div>
        )}

        <div className="mb-8 flex rounded-xl border border-[rgba(0,0,0,0.08)] bg-bg p-1">
          {(["simple", "advanced"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                mode === m
                  ? "bg-surface text-navy shadow-sm ring-1 ring-[rgba(0,0,0,0.06)]"
                  : "bg-transparent text-text-muted hover:text-navy"
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
          <div className="space-y-4">
            <div className="card p-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-surface px-6 py-14 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-colors hover:border-accent/40 hover:bg-accent/5"
              >
                <span className="text-4xl" aria-hidden>
                  🎤
                </span>
                <span className="text-lg font-semibold text-navy">Tap to upload voice note</span>
                <span className="text-xs text-text-muted">
                  WhatsApp · MP3 · M4A · MP4 video
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov"
                className="hidden"
                onChange={handleSimpleUpload}
              />
            </div>
            <Link
              to="/call"
              className="btn-secondary block w-full py-4 text-center text-sm font-semibold"
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
            className="mt-8 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
          >
            {error}
          </div>
        )}

        {showResult && (
          <div className="mt-10">
            {mode === "advanced" && (
              <div className="card mb-6 p-6">
                <PipelineSteps steps={steps} />
              </div>
            )}
            <VerificationResult
              card={card}
              transcript={result.transcript}
              variant="light"
              syncedToMap={syncedToMap}
              technicalDetails={
                mode === "advanced" && result ? (
                  <IntelligenceReportCard
                    card={card}
                    result={result}
                    hideActionCard
                  />
                ) : undefined
              }
            />
            <button
              type="button"
              onClick={reset}
              className="mt-6 text-sm text-text-muted underline"
            >
              Check another voice note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
