import type { NarrativeContext } from "../../types/contextTrace";

type NarrativeComparisonProps = {
  originalContext: NarrativeContext;
  currentClaim: NarrativeContext;
};

export default function NarrativeComparison({
  originalContext,
  currentClaim,
}: NarrativeComparisonProps) {
  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b border-[rgba(0,0,0,0.06)] px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Section 3
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">Narrative Comparison</h2>
      </div>

      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            Original Context
          </p>
          <h3 className="mt-3 text-lg font-semibold text-navy">{originalContext.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-text-body">
            {originalContext.summary}
          </p>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-4 border-t border-emerald-500/15 pt-2">
              <dt className="text-text-muted">Date</dt>
              <dd className="text-right font-medium text-text-body">{originalContext.date}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Source</dt>
              <dd className="text-right font-medium text-text-body">{originalContext.source}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-red-500/25 bg-red-500/5 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">
            Current Claim
          </p>
          <h3 className="mt-3 text-lg font-semibold text-navy">{currentClaim.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-text-body">{currentClaim.summary}</p>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-4 border-t border-red-500/15 pt-2">
              <dt className="text-text-muted">Date found</dt>
              <dd className="text-right font-medium text-text-body">{currentClaim.date}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Source</dt>
              <dd className="text-right font-medium text-text-body">{currentClaim.source}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
