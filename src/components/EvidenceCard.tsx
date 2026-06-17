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

const categoryColors: Record<string, string> = {
  Education: "text-sky-400 bg-sky-500/10 ring-sky-500/20",
  Health: "text-rose-400 bg-rose-500/10 ring-rose-500/20",
  "Public Safety": "text-orange-400 bg-orange-500/10 ring-orange-500/20",
  Government: "text-violet-400 bg-violet-500/10 ring-violet-500/20",
  "Community Services": "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  Transportation: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20",
};

export default function EvidenceCard({ card }: EvidenceCardProps) {
  const status = statusStyles[card.status];
  const statusLabel = card.statusLabel ?? status.label;
  const intel = card.regionalIntelligence;

  return (
    <article className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${status.badge}`}
          >
            {statusLabel}
          </span>
          {card.demoMode && (
            <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/25">
              Demo Mode
            </span>
          )}
          {intel && (
            <span className="inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/25">
              Regional Intelligence
            </span>
          )}
        </div>
        <span className={`text-xs font-medium uppercase ${riskStyles[card.riskLevel]}`}>
          {card.riskLevel} risk
        </span>
      </div>

      <h3 className="card-title mt-4 text-base leading-snug">{card.claim}</h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.summary}</p>

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

      {intel && intel.recommendedSources.length > 0 && (
        <div className="mt-6 border-t border-white/5 pt-5">
          <h4 className="text-sm font-semibold text-white">
            Recommended Verification Sources
          </h4>
          <p className="mt-1 text-xs text-zinc-500">
            Trusted Atlanta &amp; Georgia sources matched to this claim&apos;s
            category and location.
          </p>
          <ul className="mt-4 space-y-3">
            {intel.recommendedSources.map((source) => (
              <li
                key={source.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
                  >
                    {source.name}
                  </a>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs ring-1 ${categoryColors[source.category] ?? "text-zinc-400 bg-white/5 ring-white/10"}`}
                  >
                    {source.category}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {source.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-[rgba(0,0,0,0.06)] pt-4 text-xs text-text-muted">
        <span>Confidence: {Math.round(card.confidence * 100)}%</span>
        <span>{new Date(card.verifiedAt).toLocaleString()}</span>
      </div>
    </article>
  );
}
