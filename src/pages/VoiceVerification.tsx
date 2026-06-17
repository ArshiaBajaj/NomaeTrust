import { useCallback, useState } from "react";
import EvidenceCard from "../components/EvidenceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import PipelineSteps from "../components/PipelineSteps";
import UploadBox from "../components/UploadBox";
import { analyzeAudio, AnalyzeAudioError } from "../services/analyzeAudio";
import type {
  AudioAnalysisResult,
  EvidenceCard as EvidenceCardType,
  PipelineStep,
  RiskLevel,
  VerificationStatus,
} from "../types";

const INITIAL_STEPS: PipelineStep[] = [
  { id: "upload", label: "Upload", status: "pending" },
  { id: "transcribe", label: "Transcription", status: "pending" },
  { id: "extract", label: "Claim Extraction", status: "pending" },
  { id: "evidence", label: "Evidence Card", status: "pending" },
];

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
  const status = toVerificationStatus(result.status);

  return {
    id: `ev-${Date.now()}`,
    claim: result.claim,
    status,
    confidence: result.confidence,
    sources: ["Voice transcript", "Claim analysis"],
    summary: `Primary factual claim extracted from voice note. Status: ${status}.`,
    verifiedAt: new Date().toISOString(),
    riskLevel: toRiskLevel(result.confidence),
    sourceType: "voice",
  };
}

export default function VoiceVerification() {
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
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
    setSteps(INITIAL_STEPS);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setError(null);
    setResult(null);
    setEvidenceCard(null);
    setLoading(true);
    setSteps([
      { id: "upload", label: "Upload", status: "complete" },
      { id: "transcribe", label: "Transcription", status: "active" },
      { id: "extract", label: "Claim Extraction", status: "pending" },
      { id: "evidence", label: "Evidence Card", status: "pending" },
    ]);

    try {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "extract" ? { ...s, status: "active" } : s,
        ),
      );

      const analysis = await analyzeAudio(selectedFile);

      setSteps([
        { id: "upload", label: "Upload", status: "complete" },
        { id: "transcribe", label: "Transcription", status: "complete" },
        { id: "extract", label: "Claim Extraction", status: "complete" },
        { id: "evidence", label: "Evidence Card", status: "complete" },
      ]);

      setResult(analysis);
      setEvidenceCard(buildEvidenceCard(analysis));
    } catch (err) {
      const message =
        err instanceof AnalyzeAudioError
          ? err.message
          : "Analysis failed. Try again.";
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
    <div className="page-shell">
      <PageHeader
        title="Verify voice notes"
        description="Upload a voice note to transcribe audio and extract verifiable claims."
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8">
      <div className="card mb-8 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Pipeline
        </h2>
        <PipelineSteps steps={steps} />
      </div>

      <UploadBox
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
        label="Drop a voice note here"
        description="MP3, WAV, M4A, OGG, WEBM — up to 25 MB"
        icon="audio"
        onFileSelect={handleFileSelect}
        disabled={loading}
      />

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? "Running…" : "Analyze"}
        </button>
        {selectedFile && !loading && (
          <p className="text-sm text-text-muted">
            File: <span className="text-navy">{selectedFile.name}</span>
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm text-secondary"
        >
          {error}
        </div>
      )}

      {loading && <LoadingSpinner label="Processing audio…" />}

      {result && evidenceCard && !loading && (
        <div className="mt-12 space-y-10">
          <section>
            <h2 className="card-title text-xl">Transcript</h2>
            <div className="card mt-4 p-6">
              <p className="card-body-text text-sm">
                {result.transcript}
              </p>
            </div>
          </section>

          <section>
            <h2 className="card-title text-xl">Extracted claim</h2>
            <div className="card mt-4 p-6">
              <p className="card-body-text text-sm">
                {result.claim}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <span className="font-semibold uppercase tracking-wide text-accent">
                  {result.status}
                </span>
                <span className="text-text-muted">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="card-title text-xl">Evidence card</h2>
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
