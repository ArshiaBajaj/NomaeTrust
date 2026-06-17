import type { EvidenceCard as EvidenceCardType } from "../types";

type EvidenceCardProps = {
  card: EvidenceCardType;
};

const statusStyles = {
  verified: {
    badge: "border-success/25 bg-success/10 text-success",
    label: "Verified",
  },
  unverified: {
    badge: "border-secondary/25 bg-secondary/10 text-secondary",
    label: "Unverified",
  },
  disputed: {
    badge: "border-[rgba(0,0,0,0.1)] bg-surface-raised text-text-muted",
    label: "Disputed",
  },
  pending: {
    badge: "border-[rgba(0,0,0,0.07)] bg-surface-raised text-text-muted",
    label: "Pending",
  },
};

const riskStyles = {
  low: "text-success",
  medium: "text-text-muted",
  high: "text-secondary",
};

export default function EvidenceCard({ card }: EvidenceCardProps) {
  const status = statusStyles[card.status];

  return (
    <article className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className={`badge border ${status.badge}`}>{status.label}</span>
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${riskStyles[card.riskLevel]}`}
        >
          {card.riskLevel} risk
        </span>
      </div>

      <h3 className="card-title mt-4 text-base leading-snug">{card.claim}</h3>

      <p className="card-body-text mt-3 text-sm">{card.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {card.sources.map((source) => (
          <span
            key={source}
            className="rounded-md border border-[rgba(0,0,0,0.07)] bg-surface-raised px-2.5 py-1 text-xs text-text-muted"
          >
            {source}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[rgba(0,0,0,0.06)] pt-4 text-xs text-text-muted">
        <span>Confidence: {Math.round(card.confidence * 100)}%</span>
        <span>{new Date(card.verifiedAt).toLocaleString()}</span>
      </div>
    </article>
  );
}
