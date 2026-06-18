import { useState } from "react";
import { Link } from "react-router-dom";
import ActionCardPanel from "./ActionCardPanel";
import ExtractedClaimSection from "./ExtractedClaimSection";
import SourcesCheckedSection from "./SourcesCheckedSection";
import VerificationConfidenceGauge from "./VerificationConfidenceGauge";
import WhatWeHeardSection from "./WhatWeHeardSection";
import type { EvidenceCard } from "../types";
import { copyWhatsAppEvidence } from "../utils/reportExport";

type VerificationResultProps = {
  card: EvidenceCard;
  transcript?: string;
  transcriptTitle?: string;
  extractionNote?: string;
  variant?: "light" | "dark";
  syncedToMap?: boolean;
  technicalDetails?: React.ReactNode;
};

export default function VerificationResult({
  card,
  transcript,
  transcriptTitle,
  extractionNote,
  variant = "light",
  syncedToMap,
  technicalDetails,
}: VerificationResultProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const isDark = variant === "dark";

  const handleShare = async () => {
    const ok = await copyWhatsAppEvidence(card);
    setShareFeedback(ok ? "Copied — paste in WhatsApp" : "Copy failed");
    setTimeout(() => setShareFeedback(null), 2500);
  };

  return (
    <div className="space-y-5">
      {card.demoMode && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            isDark
              ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
              : "border-amber-500/30 bg-amber-500/10 text-amber-800"
          }`}
        >
          <p className="font-semibold">Demo mode — live analysis unavailable</p>
          <p className="mt-1 text-xs opacity-90">
            {card.demoReason ??
              "Start the backend and add your OpenAI API key to backend/.env"}
          </p>
        </div>
      )}

      {syncedToMap && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            isDark
              ? "border-emerald-500/20 bg-emerald-500/5 text-slate-200"
              : "border-accent/20 bg-accent/5 text-text-body"
          }`}
        >
          <span>Claim added to Confusion Map</span>
          <Link
            to="/trust-map"
            className={`font-semibold hover:underline ${isDark ? "text-emerald-400" : "text-accent"}`}
          >
            View map →
          </Link>
        </div>
      )}

      {transcript && (
        <WhatWeHeardSection
          transcript={transcript}
          variant={variant}
          title={transcriptTitle}
        />
      )}

      <ExtractedClaimSection
        card={card}
        variant={variant}
        extractionNote={extractionNote}
      />

      <VerificationConfidenceGauge card={card} variant={variant} />

      <SourcesCheckedSection card={card} variant={variant} />

      <ActionCardPanel card={card} variant={variant} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={handleShare} className="btn-primary flex-1 sm:flex-none">
          Share on WhatsApp
        </button>
        <a href="tel:211" className="btn-secondary flex-1 text-center sm:flex-none">
          Call 211
        </a>
        <Link to="/trust-map" className="btn-secondary flex-1 text-center sm:flex-none">
          Ask validator
        </Link>
      </div>

      {shareFeedback && (
        <p className={`text-sm ${isDark ? "text-emerald-400" : "text-success"}`}>
          {shareFeedback}
        </p>
      )}

      {technicalDetails && (
        <div>
          <button
            type="button"
            onClick={() => setShowTechnical((v) => !v)}
            className={`text-sm font-medium underline ${
              isDark ? "text-slate-400" : "text-text-muted"
            }`}
          >
            {showTechnical ? "Hide" : "Show"} technical details
          </button>
          {showTechnical && <div className="mt-4">{technicalDetails}</div>}
        </div>
      )}
    </div>
  );
}
