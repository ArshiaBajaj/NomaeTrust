import ActionCardPanel from "./ActionCardPanel";
import type { EvidenceCard as EvidenceCardType } from "../types";

type EvidenceCardProps = {
  card: EvidenceCardType;
};

const statusStyles: Record<string, { chip: string; label: string }> = {
  verified: { chip: "bg-mint-soft text-mint", label: "Verified" },
  unverified: { chip: "bg-pink-soft text-pink-deep", label: "Unverified" },
  disputed: { chip: "bg-yellow-soft text-yellow-deep", label: "Disputed" },
  pending: { chip: "bg-surface-2 text-muted", label: "Pending" },
};

const riskStyles: Record<string, string> = {
  low: "text-success",
  medium: "text-yellow-deep",
  high: "text-pink-deep",
};

export default function EvidenceCard({ card }: EvidenceCardProps) {
  const status = statusStyles[card.status] ?? statusStyles.pending;
  const statusLabel = card.statusLabel ?? status.label;
  const intel = card.regionalIntelligence;

  return (
    <article className="nt-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${status.chip}`}>
            {statusLabel}
          </span>
          {card.demoMode && (
            <span className="inline-flex rounded-full bg-yellow-soft px-3 py-1 text-xs font-bold text-yellow-deep">
              Demo mode
            </span>
          )}
          {intel && (
            <span className="inline-flex rounded-full bg-blue-soft px-3 py-1 text-xs font-bold text-blue-deep">
              Regional intelligence
            </span>
          )}
        </div>
        <span className={`text-xs font-extrabold uppercase ${riskStyles[card.riskLevel]}`}>
          {card.riskLevel} risk
        </span>
      </div>

      <h3 className="mt-3 text-[17px] font-extrabold leading-snug text-ink">{card.claim}</h3>

      <div className="mt-4">
        <ActionCardPanel card={card} />
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-body">{card.summary}</p>

      {card.recommendation && (
        <p className="mt-3 rounded-2xl bg-yellow-soft px-3.5 py-2.5 text-[13px] text-yellow-deep">
          {card.recommendation}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(card.sourceReferences?.length
          ? card.sourceReferences.map((s) => s.title)
          : card.sources
        ).map((source) => (
          <span key={source} className="nt-chip">
            {source}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[11px] font-semibold text-muted">
        <span>Confidence: {Math.round(card.confidence * 100)}%</span>
        <span>{new Date(card.verifiedAt).toLocaleString()}</span>
      </div>
    </article>
  );
}
