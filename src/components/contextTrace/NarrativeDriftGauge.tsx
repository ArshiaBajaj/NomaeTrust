import type { NarrativeDriftBand } from "../../types/contextTrace";

type NarrativeDriftGaugeProps = {
  score: number;
  band: NarrativeDriftBand;
  label: string;
  manipulationRisk?: "Low" | "Medium" | "High";
};

type BandTheme = {
  color: string;
  soft: string;
  text: string;
  grad: string;
};

function bandTheme(band: NarrativeDriftBand): BandTheme {
  switch (band) {
    case "low":
      return {
        color: "var(--color-mint)",
        soft: "var(--color-mint-soft)",
        text: "#2f9e78",
        grad: "var(--grad-mint)",
      };
    case "moderate":
      return {
        color: "var(--color-yellow-deep)",
        soft: "var(--color-yellow-soft)",
        text: "#a87a14",
        grad: "var(--grad-butter)",
      };
    case "high":
      return {
        color: "var(--color-pink-deep)",
        soft: "var(--color-pink-soft)",
        text: "#d24668",
        grad: "var(--grad-pink)",
      };
  }
}

const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;

export default function NarrativeDriftGauge({
  score,
  band,
  label,
  manipulationRisk,
}: NarrativeDriftGaugeProps) {
  const theme = bandTheme(band);
  const clamped = Math.max(0, Math.min(100, score));

  const legend: { band: NarrativeDriftBand; dot: string; text: string }[] = [
    { band: "low", dot: "var(--color-mint)", text: "0–34% Low context drift" },
    { band: "moderate", dot: "var(--color-yellow-deep)", text: "35–69% Moderate drift" },
    { band: "high", dot: "var(--color-pink-deep)", text: "70–100% High manipulation" },
  ];

  return (
    <section className="nt-card overflow-hidden p-5">
      <p className="nt-kicker">How far it drifted</p>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink">
        Narrative Drift Score
      </h2>

      <div className="mt-5 flex flex-col items-center gap-5">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke="var(--color-surface-2)"
              strokeWidth="11"
            />
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke={theme.color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${(clamped / 100) * CIRC} ${CIRC}`}
              style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,0.85,0.3,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-extrabold tabular-nums"
              style={{ color: theme.text }}
            >
              {score}
            </span>
            <span className="text-xs font-bold text-muted">/ 100</span>
          </div>
        </div>

        <div className="w-full text-center">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-sm font-extrabold"
            style={{ background: theme.soft, color: theme.text }}
          >
            {label}
          </span>
          {manipulationRisk && (
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted">
              {manipulationRisk} manipulation risk
            </p>
          )}
          <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-relaxed text-body">
            How far the current viral narrative has drifted from the image&apos;s original
            documented context.
          </p>
        </div>

        <div className="w-full">
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${clamped}%`,
                background: theme.grad,
                transition: "width 0.8s cubic-bezier(0.22,0.85,0.3,1)",
              }}
            />
          </div>
          <ul className="mt-3 grid gap-1.5">
            {legend.map((row) => (
              <li
                key={row.band}
                className="flex items-center gap-2 text-[11px]"
                style={{
                  color: row.band === band ? theme.text : "var(--color-muted)",
                  fontWeight: row.band === band ? 800 : 500,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: row.dot }}
                  aria-hidden
                />
                {row.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
