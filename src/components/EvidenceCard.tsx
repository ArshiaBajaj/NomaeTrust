import type { EvidenceCard as EvidenceCardType } from "../types";

type EvidenceCardProps = {
  card: EvidenceCardType;
};

const statusStyles = {
  verified: {
    badge: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25",
    label: "Verified",
  },
  unverified: {
    badge: "bg-red-500/15 text-red-400 ring-red-500/25",
    label: "Unverified",
  },
  disputed: {
    badge: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
    label: "Disputed",
  },
  pending: {
    badge: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/25",
    label: "Pending",
  },
};

const riskStyles = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

export default function EvidenceCard({ card }: EvidenceCardProps) {
  const status = statusStyles[card.status];

  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${status.badge}`}
        >
          {status.label}
        </span>
        <span className={`text-xs font-medium uppercase ${riskStyles[card.riskLevel]}`}>
          {card.riskLevel} risk
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug text-white">
        {card.claim}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {card.sources.map((source) => (
          <span
            key={source}
            className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-400"
          >
            {source}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-zinc-500">
        <span>Confidence: {Math.round(card.confidence * 100)}%</span>
        <span>{new Date(card.verifiedAt).toLocaleString()}</span>
      </div>
    </article>
  );
}
