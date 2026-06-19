import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [card, setCard] = useState<EvidenceCard | null>(null);
  const [syncedToMap, setSyncedToMap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCard(null);
    setSyncedToMap(false);

    try {
      const base = initialSteps();
      setSteps(setStepStatus(base, "transcribe", ["upload"]));

      const analysisPromise = analyzeAudio(file);
      await delay(500);
      setSteps(setStepStatus(base, "extract", ["upload", "transcribe"]));
      await delay(500);
      setSteps(setStepStatus(base, "regional", ["upload", "transcribe", "extract"]));

      const analysis = await analysisPromise;
      await delay(400);
      setSteps(setStepStatus(base, "evidence", ["upload", "transcribe", "extract", "regional"]));

      const evidenceCard = buildEvidenceCardFromAnalysis(analysis, "voice");
      await syncClaimToMap(
        analysis.claim,
        "voice",
        analysis.confidence,
        evidenceCard.urgentReview,
      );
      setSyncedToMap(true);

      await delay(300);
      setSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "complete" as const })));
      setResult(analysis);
      setCard(evidenceCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze voice note.");
      setSteps((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s)),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = (file: File) => {
    runAnalysis(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const reset = () => {
    setResult(null);
    setCard(null);
    setError(null);
    setSyncedToMap(false);
    setSteps(initialSteps());
  };

  const showResult = card && result && !loading;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 lg:px-8">
        <PageHeader
          title={showResult ? "Your Action Card" : "Action Cards"}
          description={
            showResult
              ? "Here's what we heard, what we found, and what to do next."
              : "Forwarded a scary voice note? Upload it — we extract the claim, check trusted sources, and tell you what to do."
          }
        />

        <div className="card mb-6 p-6">
          <PipelineSteps steps={steps} />
        </div>

        {!showResult && !loading && (
          <div className="space-y-4">
            <div className="card p-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-6 flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-surface px-6 py-12 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-colors hover:border-accent/40 hover:bg-accent/5"
              >
                <span className="text-4xl" aria-hidden>
                  🎤
                </span>
                <span className="text-lg font-semibold text-navy">Tap to upload voice note</span>
                <span className="text-xs text-text-muted">
                  WhatsApp · MP3 · M4A · MP4 video — max 25 MB
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov"
                className="hidden"
                onChange={handleInputChange}
              />

              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-text-muted">
                or drop a file
              </p>

              <UploadBox
                accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov"
                label="Drop a WhatsApp voice note or video"
                description="Analysis starts automatically when you upload"
                icon="audio"
                onFileSelect={handleFile}
                disabled={loading}
              />
            </div>

            <Link
              to="/call"
              className="btn-secondary block w-full py-4 text-center text-sm font-semibold"
            >
              Reused image out of context?
            </Link>
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <LoadingSpinner label="Checking rumor against trusted sources…" />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
          >
            {error}
          </div>
        )}

        {showResult && (
          <div className="mt-6">
            <VerificationResult
              card={card}
              transcript={result.transcript}
              variant="light"
              syncedToMap={syncedToMap}
              technicalDetails={
                <IntelligenceReportCard card={card} result={result} hideActionCard />
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
