import { useCallback, useState } from "react";
import EvidenceCard from "../components/EvidenceCard";
import LoadingSpinner from "../components/LoadingSpinner";
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
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-20 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Screenshot Verification
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Verify screenshots and viral messages
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Upload a screenshot to extract text via OCR, detect claims, and
          generate evidence cards with mocked verification results.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Verification Pipeline
        </h2>
        <PipelineSteps steps={steps} />
      </div>

      <UploadBox
        accept="image/*,.png,.jpg,.jpeg,.webp"
        label="Drop a screenshot here"
        description="Supports PNG, JPG, WEBP — any image works for this demo"
        icon="image"
        onFileSelect={handleFileSelect}
        disabled={loading}
      />

      {loading && (
        <LoadingSpinner label="Running screenshot verification pipeline…" />
      )}

      {result && !loading && (
        <div className="mt-10 space-y-10">
          <OCRPanel ocr={result.ocr!} />
          <ClaimsPanel claims={result.claims} />
          <EvidencePanel cards={result.evidenceCards} />
        </div>
      )}
    </div>
  );
}

function OCRPanel({ ocr }: { ocr: OCRResult }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">OCR Extraction</h2>
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-sans">
          {ocr.text}
        </pre>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span>Regions detected: {ocr.regions}</span>
          <span>Confidence: {Math.round(ocr.confidence * 100)}%</span>
        </div>
      </div>
    </section>
  );
}

function ClaimsPanel({ claims }: { claims: Claim[] }) {
  const statusColor = {
    verified: "text-emerald-400",
    unverified: "text-red-400",
    disputed: "text-amber-400",
    pending: "text-zinc-400",
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-white">Detected Claims</h2>
      <ul className="mt-4 space-y-3">
        {claims.map((claim) => (
          <li
            key={claim.id}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
          >
            <p className="text-sm text-zinc-300">{claim.text}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs">
              <span className={statusColor[claim.status]}>
                {claim.status}
              </span>
              <span className="text-zinc-500">
                {Math.round(claim.confidence * 100)}% confidence
              </span>
              {claim.location && (
                <span className="text-zinc-500">{claim.location.label}</span>
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
      <h2 className="text-lg font-semibold text-white">Evidence Cards</h2>
      <div className="mt-4 grid gap-4">
        {cards.map((card) => (
          <EvidenceCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
