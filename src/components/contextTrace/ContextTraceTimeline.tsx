import { useMemo, useState } from "react";
import type { TimelineAppearance } from "../../types/contextTrace";
import { useHaptic } from "../../hooks/useHaptic";

type ContextTraceTimelineProps = {
  appearances: TimelineAppearance[];
  previewUrl?: string;
};

type RoleTheme = {
  tag: string;
  dot: string;
  ring: string;
  chipBg: string;
  chipText: string;
  grad: string;
};

function roleTheme(role: TimelineAppearance["role"]): RoleTheme {
  switch (role) {
    case "earliest":
      return {
        tag: "The Truth",
        dot: "var(--color-mint)",
        ring: "rgba(143, 227, 198, 0.35)",
        chipBg: "var(--color-mint-soft)",
        chipText: "#2f9e78",
        grad: "var(--grad-mint)",
      };
    case "intermediate":
      return {
        tag: "Reuse",
        dot: "var(--color-yellow)",
        ring: "rgba(255, 211, 110, 0.4)",
        chipBg: "var(--color-yellow-soft)",
        chipText: "#a87a14",
        grad: "var(--grad-butter)",
      };
    case "current":
      return {
        tag: "The Rumor",
        dot: "var(--color-pink-deep)",
        ring: "rgba(255, 123, 162, 0.35)",
        chipBg: "var(--color-pink-soft)",
        chipText: "#d24668",
        grad: "var(--grad-pink)",
      };
  }
}

export default function ContextTraceTimeline({
  appearances,
  previewUrl,
}: ContextTraceTimelineProps) {
  const haptic = useHaptic();
  const sorted = useMemo(
    () => [...appearances].sort((a, b) => a.year - b.year),
    [appearances],
  );
  const [activeId, setActiveId] = useState(
    sorted[sorted.length - 1]?.id ?? sorted[0]?.id,
  );
  const active = sorted.find((item) => item.id === activeId) ?? sorted[0];

  if (!active) return null;

  const earliest = sorted.find((item) => item.role === "earliest");
  const current = sorted.find((item) => item.role === "current");
  const activeTheme = roleTheme(active.role);

  return (
    <section className="nt-card overflow-hidden p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="nt-kicker">How it traveled</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink">
            Context Timeline
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide">
          <span className="rounded-full bg-mint-soft px-2.5 py-1 text-[#2f9e78]">Truth</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3 text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="rounded-full bg-pink-soft px-2.5 py-1 text-[#d24668]">Rumor</span>
        </div>
      </div>

      {/* Stepper rail */}
      <ol className="relative mt-5 space-y-3 pl-7">
        <span
          className="absolute left-[9px] top-2 bottom-2 w-0.5 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, var(--color-mint) 0%, var(--color-yellow) 50%, var(--color-pink-deep) 100%)",
          }}
          aria-hidden
        />
        {sorted.map((item) => {
          const theme = roleTheme(item.role);
          const isActive = item.id === active.id;
          return (
            <li key={item.id} className="relative">
              <span
                className="absolute -left-7 top-3 h-[18px] w-[18px] rounded-full"
                style={{
                  background: theme.dot,
                  boxShadow: isActive
                    ? `0 0 0 3px var(--color-surface), 0 0 0 7px ${theme.ring}`
                    : "0 0 0 3px var(--color-surface)",
                }}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => {
                  haptic("light");
                  setActiveId(item.id);
                }}
                className="nt-press w-full rounded-3xl border p-3.5 text-left transition-all"
                style={{
                  borderColor: isActive ? theme.dot : "var(--color-line)",
                  background: isActive ? theme.chipBg : "var(--color-surface)",
                  boxShadow: isActive ? "var(--shadow-soft)" : "none",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
                    style={{ background: theme.chipBg, color: theme.chipText }}
                  >
                    {theme.tag}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-muted">
                    {item.year}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-ink">{item.source}</p>
                <p className="mt-1 text-xs leading-relaxed text-body line-clamp-2">
                  {item.contextSummary}
                </p>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Selected detail */}
      <div
        className="mt-4 overflow-hidden rounded-3xl p-4"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-line)" }}
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-extrabold uppercase tracking-wide"
              style={{ color: activeTheme.chipText }}
            >
              Selected · {active.year}
            </p>
            <p className="mt-1.5 text-base font-bold text-ink">{active.source}</p>
            <p className="mt-2 text-sm leading-relaxed text-body">{active.contextSummary}</p>
            <a
              href={active.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-blue-deep"
              onClick={(e) => e.stopPropagation()}
            >
              View source
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3.5 w-3.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          </div>
          {(active.imageUrl || (active.role === "earliest" && previewUrl)) && (
            <img
              src={active.imageUrl ?? previewUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
              style={{ border: "1px solid var(--color-line)" }}
            />
          )}
        </div>
      </div>

      {earliest && current && (
        <p className="mt-3 text-center text-xs text-muted">
          Earliest <span className="font-extrabold text-[#2f9e78]">{earliest.year}</span>
          {" → "}
          viral <span className="font-extrabold text-[#d24668]">{current.year}</span>
          {" · "}
          <span className="font-semibold text-body">
            {current.year - earliest.year} years of drift
          </span>
        </p>
      )}
    </section>
  );
}
