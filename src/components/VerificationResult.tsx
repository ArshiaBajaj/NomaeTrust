import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ActionCardPanel from "./ActionCardPanel";
import ExtractedClaimSection from "./ExtractedClaimSection";
import SourcesCheckedSection from "./SourcesCheckedSection";
import VerificationConfidenceGauge from "./VerificationConfidenceGauge";
import WhatWeHeardSection from "./WhatWeHeardSection";
import { useHaptic } from "../hooks/useHaptic";
import type { EvidenceCard } from "../types";
import { copyWhatsAppEvidence } from "../utils/reportExport";

type VerificationResultProps = {
  card: EvidenceCard;
  transcript?: string;
  transcriptTitle?: string;
  extractionNote?: string;
  variant?: "light" | "dark";
  syncedToMap?: boolean;
  technicalDetails?: ReactNode;
};

export default function VerificationResult({
  card,
  transcript,
  transcriptTitle,
  extractionNote,
  syncedToMap,
  technicalDetails,
}: VerificationResultProps) {
  const haptic = useHaptic();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  const handleShare = async () => {
    haptic("medium");
    const ok = await copyWhatsAppEvidence(card);
    setShareFeedback(ok ? "Copied — paste in WhatsApp" : "Copy failed");
    setTimeout(() => setShareFeedback(null), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      {card.demoMode && (
        <div className="rounded-2xl bg-yellow-soft px-4 py-3 text-[13px] text-yellow-deep">
          <p className="font-extrabold">Demo mode — live analysis unavailable</p>
          <p className="mt-1 text-[12px] opacity-90">
            {card.demoReason ?? "Start the backend and add your OpenAI API key to backend/.env"}
          </p>
        </div>
      )}

      {syncedToMap && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mint-soft px-4 py-3 text-[13px] text-ink">
          <span className="font-semibold">Claim added to Confusion Map</span>
          <Link to="/trust-map" className="font-extrabold text-mint hover:underline" onClick={() => haptic("light")}>
            View map →
          </Link>
        </div>
      )}

      {transcript && <WhatWeHeardSection transcript={transcript} title={transcriptTitle} />}

      <ExtractedClaimSection card={card} extractionNote={extractionNote} />

      <VerificationConfidenceGauge card={card} />

      <SourcesCheckedSection card={card} />

      <ActionCardPanel card={card} />

      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={handleShare} className="nt-btn nt-btn-pink nt-btn-block nt-press">
          Share on WhatsApp
        </button>
        <div className="flex gap-2.5">
          <a href="tel:211" className="nt-btn nt-btn-soft nt-press flex-1">
            Call 211
          </a>
          <Link to="/trust-map" className="nt-btn nt-btn-ghost nt-press flex-1" onClick={() => haptic("light")}>
            Ask validator
          </Link>
        </div>
      </div>

      {shareFeedback && (
        <p className="text-center text-[13px] font-bold text-mint">{shareFeedback}</p>
      )}

      {technicalDetails && (
        <div>
          <button
            type="button"
            onClick={() => {
              haptic("light");
              setShowTechnical((v) => !v);
            }}
            className="text-[13px] font-bold text-muted underline"
          >
            {showTechnical ? "Hide" : "Show"} technical details
          </button>
          {showTechnical && <div className="mt-4">{technicalDetails}</div>}
        </div>
      )}
    </div>
  );
}
