import { useState } from "react";
import ActionCardPanel from "./ActionCardPanel";
import ConfidenceMeter from "./ConfidenceMeter";
import RiskGauge from "./RiskGauge";
import VerificationStatusBadge from "./VerificationStatusBadge";
import { useHaptic } from "../hooks/useHaptic";
import type {
  AudioAnalysisResult,
  EvidenceCard as EvidenceCardType,
} from "../types";
import {
  computeHarmRiskScore,
  copyReport,
  copyWhatsAppEvidence,
  downloadPdfReport,
  shareReport,
} from "../utils/reportExport";

type IntelligenceReportCardProps = {
  card: EvidenceCardType;
  result: AudioAnalysisResult;
  hideActionCard?: boolean;
};

const categoryChip: Record<string, string> = {
  Education: "bg-blue-soft text-blue-deep",
  Health: "bg-pink-soft text-pink-deep",
  "Public Safety": "bg-yellow-soft text-yellow-deep",
  Government: "bg-lilac-soft text-lilac",
  "Community Services": "bg-mint-soft text-mint",
  Transportation: "bg-blue-soft text-blue-deep",
};

export default function IntelligenceReportCard({
  card,
  result,
  hideActionCard = false,
}: IntelligenceReportCardProps) {
  const haptic = useHaptic();
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const intel = card.regionalIntelligence;
  const statusLabel = card.statusLabel ?? card.status;
  const riskScore = computeHarmRiskScore(result);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleCopy = async () => {
    haptic("light");
    const ok = await copyReport(result, card);
    showFeedback(ok ? "Report copied" : "Copy failed");
  };

  const handleDownload = async () => {
    haptic("light");
    await downloadPdfReport(result, card);
    showFeedback("PDF downloaded");
  };

  const handleShare = async () => {
    haptic("light");
    const outcome = await shareReport(result, card);
    if (outcome === "shared") showFeedback("Shared");
    else if (outcome === "copied") showFeedback("Copied for WhatsApp");
    else showFeedback("Share cancelled");
  };

  const handleWhatsApp = async () => {
    haptic("light");
    const ok = await copyWhatsAppEvidence(card);
    showFeedback(ok ? "Copied for WhatsApp" : "Copy failed");
  };

  return (
    <article className="nt-card overflow-hidden p-0">
      <div className="p-5" style={{ background: "var(--grad-lilac)" }}>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/85">
          NomaeTrust Intelligence
        </p>
        <h3 className="mt-0.5 text-[18px] font-extrabold text-white">Evidence report</h3>
        <p className="mt-1 text-[11px] font-semibold text-white/80">REF {card.id}</p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleCopy} className="nt-chip nt-press">
            Copy report
          </button>
          <button type="button" onClick={handleDownload} className="nt-chip nt-press">
            Download PDF
          </button>
          <button type="button" onClick={handleShare} className="nt-chip nt-press">
            Share
          </button>
          <button type="button" onClick={handleWhatsApp} className="nt-chip nt-press">
            WhatsApp
          </button>
          {actionFeedback && (
            <span className="self-center text-[12px] font-bold text-mint">{actionFeedback}</span>
          )}
        </div>

        <VerificationStatusBadge label={statusLabel} />

        <div className="rounded-2xl bg-surface-2 p-4">
          <ConfidenceMeter value={card.confidence} />
        </div>

        <div className="flex justify-center rounded-2xl bg-surface-2 p-4">
          <RiskGauge score={riskScore} />
        </div>

        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="nt-kicker">Primary extracted claim</p>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">{card.claim}</p>
        </div>

        <div className="rounded-2xl bg-blue-soft p-4">
          <p className="nt-kicker">Source transcript</p>
          <p className="mt-2 text-[13px] italic leading-relaxed text-body" style={{ borderLeft: "3px solid var(--color-blue)", paddingLeft: 12 }}>
            &ldquo;{result.transcript}&rdquo;
          </p>
        </div>

        {!hideActionCard && <ActionCardPanel card={card} />}

        <div>
          <p className="nt-kicker">Intelligence assessment</p>
          <p className="mt-2 text-[13px] leading-relaxed text-body">{card.summary}</p>
          {card.recommendation && (
            <p className="mt-3 rounded-2xl bg-yellow-soft px-3.5 py-2.5 text-[13px] text-yellow-deep">
              {card.recommendation}
            </p>
          )}
          {card.confidenceBand && (
            <p className="mt-2 nt-kicker">Confidence band: {card.confidenceBand}</p>
          )}
          {card.sourceReferences && card.sourceReferences.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {card.sourceReferences.map((s) => (
                <li key={s.url} className="text-[12px]">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-deep hover:underline">
                    {s.title} ({s.date}) ↗
                  </a>
                  <p className="text-muted">{s.snippet}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {card.translations && (
          <div className="rounded-2xl bg-mint-soft p-4">
            <p className="nt-kicker text-mint">Multilingual sharing (WhatsApp)</p>
            <div className="mt-3 flex flex-col gap-3 text-[13px] text-body">
              <div>
                <p className="text-[11px] font-bold text-muted">Somali</p>
                <p className="mt-1">{card.translations.somali}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted">Español</p>
                <p className="mt-1">{card.translations.spanish}</p>
              </div>
            </div>
          </div>
        )}

        {intel && (
          <div className="rounded-2xl bg-blue-soft p-4">
            <p className="nt-kicker text-blue-deep">Regional intelligence — Atlanta / Georgia</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="nt-chip">{intel.claimCategory}</span>
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${categoryChip[intel.sourceCategory] ?? "nt-chip"}`}>
                {intel.sourceCategory}
              </span>
              {intel.locations.map((loc) => (
                <span key={loc} className="nt-chip">
                  {loc}
                </span>
              ))}
            </div>

            {intel.recommendedSources.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[14px] font-bold text-ink">Recommended verification sources</p>
                <p className="mt-1 text-[12px] text-muted">
                  Official Atlanta &amp; Georgia sources for independent claim verification.
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {intel.recommendedSources.map((source) => (
                    <li key={source.id} className="rounded-2xl bg-surface px-3.5 py-3" style={{ boxShadow: "var(--shadow-soft)" }}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-blue-deep hover:underline">
                          {source.name} ↗
                        </a>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${categoryChip[source.category] ?? "bg-surface-2 text-muted"}`}>
                          {source.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{source.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10px] font-semibold text-muted">
          <span>Generated {new Date(card.verifiedAt).toLocaleString()}</span>
          <span className="uppercase tracking-widest">Verify before harm spreads</span>
        </div>
      </div>
    </article>
  );
}
