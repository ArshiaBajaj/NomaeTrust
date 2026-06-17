import { useCallback, useState } from "react";
import EvidenceCard from "../components/EvidenceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import PipelineSteps from "../components/PipelineSteps";
import UploadBox from "../components/UploadBox";
import { runScreenshotVerificationPipeline } from "../services/verification";
import type {
  Claim,
  EvidenceCard as EvidenceCardType,
  OCRResult,
  PipelineStep,
  VerificationPipelineResult,
} from "../types";

const INITIAL_STEPS: PipelineStep[] = [
  { id: "upload", label: "Upload", status: "pending" },
  { id: "ocr", label: "OCR Extraction", status: "pending" },
  { id: "extract", label: "Claim Detection", status: "pending" },
  { id: "verify", label: "Verification", status: "pending" },
  { id: "evidence", label: "Evidence Cards", status: "pending" },
];

export default function ScreenshotVerification() {
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationPipelineResult | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setResult(null);
    setLoading(true);
    setSteps([
      { id: "upload", label: "Upload", status: "complete" },
      { id: "ocr", label: "OCR Extraction", status: "active" },
      { id: "extract", label: "Claim Detection", status: "pending" },
      { id: "verify", label: "Verification", status: "pending" },
      { id: "evidence", label: "Evidence Cards", status: "pending" },
    ]);

    try {
      const pipelineResult = await runScreenshotVerificationPipeline(file);

      setSteps([
        { id: "upload", label: "Upload", status: "complete" },
        { id: "ocr", label: "OCR Extraction", status: "complete" },
        { id: "extract", label: "Claim Detection", status: "complete" },
        { id: "verify", label: "Verification", status: "complete" },
        { id: "evidence", label: "Evidence Cards", status: "complete" },
      ]);
      setResult(pipelineResult);
    } catch {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "ocr" ? { ...s, status: "error" as const } : s,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-shell">
      <PageHeader
        title="Verify screenshots"
        description="Upload a screenshot to extract text, detect claims, and generate evidence cards."
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8">
      <div className="card mb-8 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Pipeline
        </h2>
        <PipelineSteps steps={steps} />
      </div>

      <UploadBox
        accept="image/*,.png,.jpg,.jpeg,.webp"
        label="Drop a screenshot here"
        description="PNG, JPG, WEBP supported"
        icon="image"
        onFileSelect={handleFileSelect}
        disabled={loading}
      />

      {loading && <LoadingSpinner label="Processing image…" />}

      {result && !loading && (
        <div className="mt-12 space-y-10">
          <OCRPanel ocr={result.ocr!} />
          <ClaimsPanel claims={result.claims} />
          <EvidencePanel cards={result.evidenceCards} />
        </div>
      )}
      </div>
    </div>
  );
}

function OCRPanel({ ocr }: { ocr: OCRResult }) {
  return (
    <section>
      <h2 className="card-title text-xl">OCR extraction</h2>
      <div className="card mt-4 p-6">
        <pre className="card-body-text whitespace-pre-wrap font-sans text-sm">
          {ocr.text}
        </pre>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-muted">
          <span>Regions: {ocr.regions}</span>
          <span>Confidence: {Math.round(ocr.confidence * 100)}%</span>
        </div>
      </div>
    </section>
  );
}

function ClaimsPanel({ claims }: { claims: Claim[] }) {
  const statusColor = {
    verified: "text-success",
    unverified: "text-secondary",
    disputed: "text-text-muted",
    pending: "text-text-muted",
  };

  return (
    <section>
      <h2 className="card-title text-xl">Detected claims</h2>
      <ul className="mt-4 space-y-3">
        {claims.map((claim) => (
          <li key={claim.id} className="card p-4">
            <p className="card-body-text text-sm">{claim.text}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs">
              <span
                className={`font-semibold uppercase tracking-wide ${statusColor[claim.status]}`}
              >
                {claim.status}
              </span>
              <span className="text-text-muted">
                {Math.round(claim.confidence * 100)}% confidence
              </span>
              {claim.location && (
                <span className="text-text-muted">{claim.location.label}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvidencePanel({ cards }: { cards: EvidenceCardType[] }) {
  return (
    <section>
      <h2 className="card-title text-xl">Evidence cards</h2>
      <div className="mt-4 grid gap-4">
        {cards.map((card) => (
          <EvidenceCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
