import { useCallback, useState } from "react";
import IntelligenceReportCard from "../components/IntelligenceReportCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PipelineSteps from "../components/PipelineSteps";
import UploadBox from "../components/UploadBox";
import { analyzeAudio } from "../services/analyzeAudio";
import type {
  AudioAnalysisResult,
  EvidenceCard as EvidenceCardType,
  PipelineStep,
  RiskLevel,
  VerificationStatus,
} from "../types";

const PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  { id: "upload", label: "Upload" },
  { id: "transcribe", label: "Transcription" },
  { id: "extract", label: "Claim Extraction" },
  { id: "regional", label: "Regional Intelligence" },
  { id: "evidence", label: "Evidence Card" },
];

function initialSteps(): PipelineStep[] {
  return PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" as const }));
}

function toVerificationStatus(status: string): VerificationStatus {
  if (
    status === "verified" ||
    status === "unverified" ||
    status === "disputed" ||
    status === "pending"
  ) {
    return status;
  }
  return "pending";
}

function toRiskLevel(confidence: number): RiskLevel {
  if (confidence >= 0.75) return "low";
  if (confidence >= 0.45) return "medium";
  return "high";
}

function buildEvidenceCard(result: AudioAnalysisResult): EvidenceCardType {
  const isDemo = result.demoMode === true;
  const statusLabel = isDemo ? "Needs Verification" : result.status;

  return {
    id: `NT-${Date.now().toString(36).toUpperCase()}`,
    claim: result.claim,
    status: isDemo ? "pending" : toVerificationStatus(result.status),
    statusLabel,
    confidence: result.confidence,
    sources: isDemo
      ? ["Demo Mode", "Regional Intelligence DB"]
      : ["OpenAI Whisper", "GPT-4o-mini", "Regional Intelligence DB"],
    summary: isDemo
      ? "Voice note analysis indicates a potentially false community service closure claim. Regional intelligence cross-referenced Atlanta/Georgia trusted sources for verification."
      : `Primary factual claim extracted from voice note via Whisper transcription and GPT-4o-mini analysis. Status: ${statusLabel}.`,
    verifiedAt: new Date().toISOString(),
    riskLevel: toRiskLevel(result.confidence),
    sourceType: "voice",
    demoMode: isDemo,
    regionalIntelligence: result.regionalIntelligence,
  };
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

export default function VoiceVerification() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [evidenceCard, setEvidenceCard] = useState<EvidenceCardType | null>(
    null,
  );

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);
    setEvidenceCard(null);
    setError(null);
    setSteps(initialSteps());
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setResult(null);
    setEvidenceCard(null);
    setError(null);
    setLoading(true);

    try {
      const base = initialSteps();
      setSteps(setStepStatus(base, "transcribe", ["upload"]));

      const analysisPromise = analyzeAudio(selectedFile);

      await delay(600);
      setSteps(setStepStatus(base, "extract", ["upload", "transcribe"]));

      await delay(700);
      setSteps(
        setStepStatus(base, "regional", ["upload", "transcribe", "extract"]),
      );

      const analysis = await analysisPromise;

      await delay(500);
      setSteps(
        setStepStatus(base, "evidence", [
          "upload",
          "transcribe",
          "extract",
          "regional",
        ]),
      );

      await delay(400);
      setSteps(
        PIPELINE_STEPS.map((s) => ({ ...s, status: "complete" as const })),
      );

      setResult(analysis);
      setEvidenceCard(buildEvidenceCard(analysis));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong during analysis.";
      setError(message);
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "active" ? { ...s, status: "error" } : s,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  return (
    <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mb-10">
        <div className="inline-flex items-center gap-2 rounded border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          Voice Intelligence Unit
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">
          Voice Verification Command Center
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          AI-powered voice analysis with Atlanta &amp; Georgia regional
          intelligence. Upload, analyze, and generate official evidence cards
          for claim verification.
        </p>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <PipelineSteps steps={steps} />
      </div>

      <div className="relative rounded-xl border border-slate-700/60 bg-slate-900/30 p-6 backdrop-blur-sm">
        <UploadBox
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
          label="Submit voice recording for analysis"
          description="MP3 · WAV · M4A · OGG · WEBM — classified handling, max 25 MB"
          icon="audio"
          onFileSelect={handleFileSelect}
          disabled={loading}
        />

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing…
              </>
            ) : (
              <>
                Initiate Analysis
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </>
            )}
          </button>
          {selectedFile && !loading && (
            <p className="font-mono text-xs text-slate-500">
              FILE: <span className="text-slate-300">{selectedFile.name}</span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="relative mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="relative mt-8 animate-fade-in">
          <LoadingSpinner label="Running AI analysis pipeline…" />
        </div>
      )}

      {result && evidenceCard && !loading && (
        <div className="relative mt-12 animate-fade-in-up space-y-6">
          {result.demoMode && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Demo analysis active — live OpenAI transcription activates when
              billing is enabled.
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Intelligence Report
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
          </div>

          <IntelligenceReportCard card={evidenceCard} result={result} />
        </div>
      )}
    </div>
  );
}
