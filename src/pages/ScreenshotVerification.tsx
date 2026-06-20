import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PipelineSteps from "../components/PipelineSteps";
import VerificationResult from "../components/VerificationResult";
import { useHaptic } from "../hooks/useHaptic";
import { analyzeImage } from "../services/analyzeImage";
import type { EvidenceCard as EvidenceCardType, PipelineStep } from "../types";
import { buildEvidenceCardFromAnalysis } from "../utils/evidenceCardBuilder";

const ACCEPT = "image/*,.png,.jpg,.jpeg,.webp";

const INITIAL_STEPS: PipelineStep[] = [
  { id: "upload", label: "Upload", status: "pending" },
  { id: "ocr", label: "OCR extraction", status: "pending" },
  { id: "extract", label: "Claim detection", status: "pending" },
  { id: "verify", label: "RAG verification", status: "pending" },
  { id: "evidence", label: "Action Card", status: "pending" },
];

export default function ScreenshotVerification() {
  const haptic = useHaptic();
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(false);
  const [evidenceCard, setEvidenceCard] = useState<EvidenceCardType | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [syncedToMap, setSyncedToMap] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      haptic("medium");
      setEvidenceCard(null);
      setOcrText(null);
      setSyncedToMap(false);
      setLoading(true);
      setSteps([
        { id: "upload", label: "Upload", status: "complete" },
        { id: "ocr", label: "OCR extraction", status: "active" },
        { id: "extract", label: "Claim detection", status: "pending" },
        { id: "verify", label: "RAG verification", status: "pending" },
        { id: "evidence", label: "Action Card", status: "pending" },
      ]);

      try {
        const result = await analyzeImage(file);
        setOcrText(result.ocr.text);
        const card = buildEvidenceCardFromAnalysis(result, "screenshot");
        setSyncedToMap(true);

        setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" as const })));
        setEvidenceCard(card);
        haptic("success");
      } catch {
        setSteps((prev) =>
          prev.map((s) => (s.id === "ocr" ? { ...s, status: "error" as const } : s)),
        );
        haptic("error");
      } finally {
        setLoading(false);
      }
    },
    [haptic],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const reset = () => {
    haptic("light");
    setEvidenceCard(null);
    setOcrText(null);
    setSyncedToMap(false);
    setSteps(INITIAL_STEPS);
  };

  const showResult = evidenceCard && !loading;

  return (
    <div className="nt-screen relative">
      <span className="nt-blob" style={{ width: 200, height: 200, top: -40, right: -60, background: "#ffb6cb" }} />
      <span className="nt-blob" style={{ width: 180, height: 180, top: 70, left: -50, background: "#b9a8f2" }} />

      <header className="relative">
        <p className="nt-kicker nt-kicker--news">Verify a screenshot</p>
        <h1 className="nt-h1 mt-1">
          {showResult ? "Your Action Card" : "Screenshots"}
        </h1>
        <p className="mt-1 text-[14px] leading-relaxed text-body">
          {showResult
            ? "Here's what we read, what we found, and what to do next."
            : "Snap or upload a forwarded image. We read the text and build an Action Card."}
        </p>
      </header>

      {!showResult && (
        <Link
          to="/call"
          onClick={() => haptic("light")}
          className="relative overflow-hidden rounded-[28px] p-5 text-white nt-press"
          style={{ background: "var(--grad-lilac)", boxShadow: "var(--shadow-lift)" }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/85">
            Context Trace
          </p>
          <p className="mt-2 text-[14px] font-semibold leading-relaxed">
            See how an image's story changes over time — trace original context vs. mutated narratives.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-extrabold">
            Try Context Trace →
          </span>
        </Link>
      )}

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
                ? { borderColor: "var(--color-pink)", background: "var(--color-pink-soft)" }
                : undefined
            }
          >
            <span className="nt-tile nt-tile--pink" style={{ width: 64, height: 64, fontSize: 30 }} aria-hidden>
              📸
            </span>
            <span className="text-[16px] font-extrabold text-ink">Drop or upload a screenshot</span>
            <span className="text-[12px] text-muted">PNG · JPG · WEBP — or take a photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={handleInputChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />

          <button
            type="button"
            onClick={() => {
              haptic("light");
              cameraInputRef.current?.click();
            }}
            className="nt-btn nt-btn-soft nt-btn-block nt-press"
          >
            📷 Take a photo
          </button>
        </div>
      )}

      {loading && (
        <div className="relative nt-card flex flex-col items-center gap-3 p-8">
          <span className="nt-spinner" aria-hidden />
          <p className="text-[14px] font-semibold text-body">Processing image…</p>
        </div>
      )}

      {showResult && (
        <div className="relative flex flex-col gap-4">
          <VerificationResult
            card={evidenceCard}
            transcript={ocrText ?? undefined}
            transcriptTitle="What we read"
            extractionNote="This claim was automatically extracted from the screenshot."
            syncedToMap={syncedToMap}
          />
          <button type="button" onClick={reset} className="nt-btn nt-btn-ghost nt-btn-block nt-press">
            Check another screenshot
          </button>
        </div>
      )}
    </div>
  );
}
