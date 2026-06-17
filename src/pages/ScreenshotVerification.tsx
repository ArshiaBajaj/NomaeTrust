import { useCallback, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import PipelineSteps from "../components/PipelineSteps";
import UploadBox from "../components/UploadBox";
import VerificationResult from "../components/VerificationResult";
import { analyzeImage } from "../services/analyzeImage";
import { syncClaimToMap } from "../services/map";
import type { EvidenceCard as EvidenceCardType, PipelineStep } from "../types";
import { buildEvidenceCardFromAnalysis } from "../utils/evidenceCardBuilder";

const INITIAL_STEPS: PipelineStep[] = [
  { id: "upload", label: "Upload", status: "pending" },
  { id: "ocr", label: "OCR Extraction", status: "pending" },
  { id: "extract", label: "Claim Detection", status: "pending" },
  { id: "verify", label: "RAG Verification", status: "pending" },
  { id: "evidence", label: "Action Card", status: "pending" },
];

export default function ScreenshotVerification() {
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(false);
  const [evidenceCard, setEvidenceCard] = useState<EvidenceCardType | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [syncedToMap, setSyncedToMap] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setEvidenceCard(null);
    setOcrText(null);
    setSyncedToMap(false);
    setLoading(true);
    setSteps([
      { id: "upload", label: "Upload", status: "complete" },
      { id: "ocr", label: "OCR Extraction", status: "active" },
      { id: "extract", label: "Claim Detection", status: "pending" },
      { id: "verify", label: "RAG Verification", status: "pending" },
      { id: "evidence", label: "Action Card", status: "pending" },
    ]);

    try {
      const result = await analyzeImage(file);
      setOcrText(result.ocr.text);
      const card = buildEvidenceCardFromAnalysis(result, "screenshot");
      await syncClaimToMap(result.claim, "screenshot", result.confidence, card.urgentReview);
      setSyncedToMap(true);

      setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "complete" as const })));
      setEvidenceCard(card);
    } catch {
      setSteps((prev) =>
        prev.map((s) => (s.id === "ocr" ? { ...s, status: "error" as const } : s)),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-shell">
      <PageHeader
        title="Screenshot verification"
        description="Upload a forwarded image or screenshot. We read the text, detect the claim, and generate an Action Card."
      />

      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 lg:px-8">
        <div className="card mb-8 p-6">
          <PipelineSteps steps={steps} />
        </div>

        <UploadBox
          accept="image/*,.png,.jpg,.jpeg,.webp"
          label="Drop a screenshot or forwarded image"
          description="PNG, JPG, WEBP supported"
          icon="image"
          onFileSelect={handleFileSelect}
          disabled={loading}
        />

        {loading && <LoadingSpinner label="Processing image…" />}

        {evidenceCard && !loading && (
          <div className="mt-10">
            <h2 className="card-title text-xl">Your Action Card</h2>
            <div className="mt-6">
              <VerificationResult
                card={evidenceCard}
                syncedToMap={syncedToMap}
                technicalDetails={
                  ocrText ? (
                    <div className="card p-5">
                      <p className="text-xs font-semibold uppercase text-text-muted">
                        OCR extraction
                      </p>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-text-body">
                        {ocrText}
                      </pre>
                      <p className="mt-4 text-xs font-semibold uppercase text-text-muted">
                        Extracted claim
                      </p>
                      <p className="mt-2 text-sm text-text-body">{evidenceCard.claim}</p>
                    </div>
                  ) : undefined
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
