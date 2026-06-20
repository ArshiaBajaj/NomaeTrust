import type { NarrativeContext } from "../../types/contextTrace";

type NarrativeComparisonProps = {
  originalContext: NarrativeContext;
  currentClaim: NarrativeContext;
};

type Side = {
  context: NarrativeContext;
  kicker: string;
  dateLabel: string;
  grad: string;
  chipBg: string;
  chipText: string;
  border: string;
};

function Panel({ side }: { side: Side }) {
  const { context, kicker, dateLabel, grad, chipBg, chipText, border } = side;
  return (
    <article
      className="relative overflow-hidden rounded-3xl p-4"
      style={{ background: "var(--color-surface)", border: `1px solid ${border}` }}
    >
      <span
        className="inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide"
        style={{ background: chipBg, color: chipText }}
      >
        {kicker}
      </span>
      <h3 className="mt-2.5 text-base font-extrabold leading-snug text-ink">{context.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-body">{context.summary}</p>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div
          className="flex justify-between gap-3 border-t pt-2"
          style={{ borderColor: "var(--color-line)" }}
        >
          <dt className="text-muted">{dateLabel}</dt>
          <dd className="text-right font-bold text-body">{context.date}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Source</dt>
          <dd className="text-right font-bold text-body">{context.source}</dd>
        </div>
      </dl>
      <span
        className="pointer-events-none absolute -bottom-6 -right-4 h-16 w-16 rounded-full opacity-50"
        style={{ background: grad }}
        aria-hidden
      />
    </article>
  );
}

export default function NarrativeComparison({
  originalContext,
  currentClaim,
}: NarrativeComparisonProps) {
  return (
    <section className="nt-card overflow-hidden p-5">
      <p className="nt-kicker">Then vs now</p>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink">Narrative Comparison</h2>

      <div className="mt-4 grid gap-3">
        <Panel
          side={{
            context: originalContext,
            kicker: "Original Context",
            dateLabel: "Date",
            grad: "var(--grad-mint)",
            chipBg: "var(--color-mint-soft)",
            chipText: "#2f9e78",
            border: "rgba(143, 227, 198, 0.5)",
          }}
        />

        <div className="flex items-center justify-center" aria-hidden>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-white"
            style={{ background: "var(--grad-pink)", boxShadow: "var(--shadow-pink)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </span>
        </div>

        <Panel
          side={{
            context: currentClaim,
            kicker: "Current Viral Claim",
            dateLabel: "Date found",
            grad: "var(--grad-pink)",
            chipBg: "var(--color-pink-soft)",
            chipText: "#d24668",
            border: "rgba(255, 123, 162, 0.5)",
          }}
        />
      </div>
    </section>
  );
}
