import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import IntelligenceReportCard from "../components/IntelligenceReportCard";
import PipelineSteps from "../components/PipelineSteps";
import VerificationResult from "../components/VerificationResult";
import { useHaptic } from "../hooks/useHaptic";
import { analyzeAudio } from "../services/analyzeAudio";
import type { AudioAnalysisResult, EvidenceCard, PipelineStep } from "../types";
import { buildEvidenceCardFromAnalysis } from "../utils/evidenceCardBuilder";

const ACCEPT = "audio/*,video/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.mov";

const PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  { id: "upload", label: "Upload" },
  { id: "transcribe", label: "Transcription" },
  { id: "extract", label: "Claim extraction" },
  { id: "regional", label: "RAG retrieval" },
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
  const haptic = useHaptic();
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [card, setCard] = useState<EvidenceCard | null>(null);
  const [syncedToMap, setSyncedToMap] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(
    async (file: File) => {
      haptic("medium");
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
        setSyncedToMap(true);

        await delay(300);
        setSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "complete" as const })));
        setResult(analysis);
        setCard(evidenceCard);
        haptic("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not analyze voice note.");
        setSteps((prev) => prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s)));
        haptic("error");
      } finally {
        setLoading(false);
      }
    },
    [haptic],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runAnalysis(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runAnalysis(file);
  };

  const reset = () => {
    haptic("light");
    setResult(null);
    setCard(null);
    setError(null);
    setSyncedToMap(false);
    setSteps(initialSteps());
  };

  const showResult = card && result && !loading;

  return (
    <div className="nt-screen relative">
      <span className="nt-blob" style={{ width: 200, height: 200, top: -40, left: -60, background: "#8fa6f6" }} />
      <span className="nt-blob" style={{ width: 180, height: 180, top: 60, right: -50, background: "#ff9db8" }} />

      <header className="relative">
        <p className="nt-kicker nt-kicker--news">Verify a voice note</p>
        <h1 className="nt-h1 mt-1">
          {showResult ? "Your Action Card" : "Voice notes"}
        </h1>
        <p className="mt-1 text-[14px] leading-relaxed text-body">
          {showResult
            ? "Here's what we heard, what we found, and what to do next."
            : "Upload a forwarded voice note — we check trusted sources and tell you what to do."}
        </p>
      </header>

      {!showResult && (
        <section className="relative nt-card p-5">
          <PipelineSteps steps={steps} />
        </section>
      )}

      {!showResult && !loading && (
        <div className="relative flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              haptic("light");
              fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="nt-card nt-press flex flex-col items-center gap-3 px-6 py-10 text-center"
            style={
              dragging
                ? { borderColor: "var(--color-blue)", background: "var(--color-blue-soft)" }
                : undefined
            }
          >
            <span className="nt-tile nt-tile--blue" style={{ width: 64, height: 64, fontSize: 30 }} aria-hidden>
              🎙️
            </span>
            <span className="text-[16px] font-extrabold text-ink">Tap to upload a voice note</span>
            <span className="text-[12px] text-muted">
              WhatsApp · MP3 · M4A · MP4 video — or drop a file here
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={handleInputChange}
          />

          <Link
            to="/call"
            onClick={() => haptic("light")}
            className="nt-btn nt-btn-soft nt-btn-block nt-press"
          >
            Reused image out of context?
          </Link>
        </div>
      )}

      {loading && (
        <div className="relative nt-card flex flex-col items-center gap-3 p-8">
          <span className="nt-spinner" aria-hidden />
          <p className="text-[14px] font-semibold text-body">
            Checking rumor against trusted sources…
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="relative rounded-2xl bg-pink-soft px-4 py-3 text-[13px] font-semibold text-pink-deep">
          {error}
        </div>
      )}

      {showResult && (
        <div className="relative flex flex-col gap-4">
          <VerificationResult
            card={card}
            transcript={result.transcript}
            syncedToMap={syncedToMap}
            technicalDetails={<IntelligenceReportCard card={card} result={result} hideActionCard />}
          />
          <button
            type="button"
            onClick={reset}
            className="nt-btn nt-btn-ghost nt-btn-block nt-press"
          >
            Check another voice note
          </button>
        </div>
      )}
    </div>
  );
}
