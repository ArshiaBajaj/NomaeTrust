import { useCallback, useState } from "react";
import IntelligenceReportCard from "../components/IntelligenceReportCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
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

  return {
    id: `NT-${Date.now().toString(36).toUpperCase()}`,
    claim: result.claim,
    status: isDemo ? "pending" : toVerificationStatus(result.status),
    statusLabel: isDemo ? "Needs Verification" : result.status,
    confidence: result.confidence,
    sources: ["OpenAI Whisper", "GPT-4o-mini"],
    summary: `Primary factual claim extracted from voice note via Whisper transcription and GPT-4o-mini analysis. Status: ${status}.`,
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
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [evidenceCard, setEvidenceCard] = useState<EvidenceCardType | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult(null);
    setEvidenceCard(null);
    setSteps(initialSteps());
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setResult(null);
    setEvidenceCard(null);
    setLoading(true);

    const base = initialSteps();
    setSteps(setStepStatus(base, "transcribe", ["upload"]));

    const analysisPromise = analyzeAudio(selectedFile);

    await delay(600);
    setSteps(setStepStatus(base, "extract", ["upload", "transcribe"]));

    await delay(700);
    setSteps(setStepStatus(base, "regional", ["upload", "transcribe", "extract"]));

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
        err instanceof AnalyzeAudioError
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
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-20 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Voice Verification
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Verify voice notes before harm spreads
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Upload a voice note and analyze it with OpenAI Whisper transcription
          and GPT-4o-mini claim extraction.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Verification Pipeline
        </h2>
        <PipelineSteps steps={steps} />
      </div>

      <UploadBox
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
        label="Drop a voice note here"
        description="Supports MP3, WAV, M4A, OGG, WEBM — up to 25 MB"
        icon="audio"
        onFileSelect={handleFileSelect}
        disabled={loading}
      />

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Analyzing…" : "Analyze"}
          {!loading && (
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
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          )}
        </button>
        {selectedFile && !loading && (
          <p className="text-sm text-zinc-500">
            Ready to analyze:{" "}
            <span className="text-zinc-300">{selectedFile.name}</span>
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {loading && (
        <LoadingSpinner label="Transcribing with Whisper and extracting claims…" />
      )}

      {result && evidenceCard && !loading && (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-lg font-semibold text-white">Transcript</h2>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm leading-relaxed text-zinc-300">
                &ldquo;{result.transcript}&rdquo;
              </p>
            </div>
          )}

          <section>
            <h2 className="text-lg font-semibold text-white">
              Extracted Claim
            </h2>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm leading-relaxed text-zinc-300">
                {result.claim}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <span className="text-indigo-400 capitalize">
                  {result.status}
                </span>
                <span className="text-zinc-500">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Evidence Card</h2>
            <div className="mt-4">
              <EvidenceCard card={evidenceCard} />
            </div>
          </section>
        </div>
      )}
      </div>
    </div>
  );
}
