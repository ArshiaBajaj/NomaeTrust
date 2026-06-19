import { useMemo, useState } from "react";
import type { TimelineAppearance } from "../../types/contextTrace";

type ContextTraceTimelineProps = {
  appearances: TimelineAppearance[];
  previewUrl?: string;
};

function roleStyles(role: TimelineAppearance["role"]) {
  switch (role) {
    case "earliest":
      return {
        dot: "bg-emerald-500 ring-emerald-500/25",
        label: "text-emerald-700",
        card: "border-emerald-500/30 bg-emerald-500/5",
      };
    case "intermediate":
      return {
        dot: "bg-amber-500 ring-amber-500/25",
        label: "text-amber-700",
        card: "border-amber-500/25 bg-amber-500/5",
      };
    case "current":
      return {
        dot: "bg-red-500 ring-red-500/25",
        label: "text-red-700",
        card: "border-red-500/30 bg-red-500/5",
      };
  }
}

export default function ContextTraceTimeline({
  appearances,
  previewUrl,
}: ContextTraceTimelineProps) {
  const sorted = useMemo(
    () => [...appearances].sort((a, b) => a.year - b.year),
    [appearances],
  );
  const [activeId, setActiveId] = useState(sorted[sorted.length - 1]?.id ?? sorted[0]?.id);
  const active = sorted.find((item) => item.id === activeId) ?? sorted[0];

  if (!active) return null;

  const earliest = sorted.find((item) => item.role === "earliest");
  const current = sorted.find((item) => item.role === "current");

  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b border-[rgba(0,0,0,0.06)] px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Section 2
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">Context Timeline</h2>
        <div className="mt-3 flex justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-emerald-700">The Truth</span>
          <span className="text-red-700">The Rumor</span>
        </div>
      </div>

      <div className="relative px-6 py-8">
        <div className="absolute left-6 right-6 top-[4.5rem] hidden h-1 rounded-full bg-gradient-to-r from-emerald-500/30 via-amber-500/25 to-red-500/30 lg:block" />

        <div className="grid gap-6 lg:grid-cols-3">
          {sorted.map((item) => {
            const styles = roleStyles(item.role);
            const isActive = item.id === active.id;
            const cornerLabel =
              item.role === "earliest"
                ? "The Truth"
                : item.role === "current"
                  ? "The Rumor"
                  : "Reuse";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`relative rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? `${styles.card} shadow-md ring-2 ring-accent/10`
                    : "border-[rgba(0,0,0,0.08)] bg-surface hover:border-accent/20"
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full ring-4 ${styles.dot} ${
                      isActive ? "scale-110" : "opacity-80"
                    }`}
                  />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.label}`}>
                    {cornerLabel}
                  </span>
                </div>
                <p className="font-mono text-xs text-text-muted">{item.date}</p>
                <p className="mt-1 text-sm font-semibold text-navy">{item.source}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-body">
                  {item.contextSummary}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Selected appearance · {active.year}
              </p>
              <p className="mt-2 text-base font-semibold text-navy">{active.source}</p>
              <p className="mt-2 text-sm leading-relaxed text-text-body">
                {active.contextSummary}
              </p>
              <a
                href={active.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View source ↗
              </a>
            </div>
            {(active.imageUrl || (active.role === "earliest" && previewUrl)) && (
              <img
                src={active.imageUrl ?? previewUrl}
                alt=""
                className="h-24 w-24 rounded-lg border border-[rgba(0,0,0,0.08)] object-cover"
              />
            )}
          </div>
        </div>

        {earliest && current && (
          <p className="mt-4 text-center text-xs text-text-muted">
            Earliest known: <span className="font-semibold text-emerald-700">{earliest.year}</span>
            {" · "}
            Current viral claim: <span className="font-semibold text-red-700">{current.year}</span>
            {" · "}
            <span className="text-text-body">{current.year - earliest.year} years of drift</span>
          </p>
        )}
      </div>
    </section>
  );
}
