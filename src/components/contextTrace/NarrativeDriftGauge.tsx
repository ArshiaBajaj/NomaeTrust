import type { NarrativeDriftBand } from "../../types/contextTrace";

type NarrativeDriftGaugeProps = {
  score: number;
  band: NarrativeDriftBand;
  label: string;
  manipulationRisk?: "Low" | "Medium" | "High";
};

function bandColor(band: NarrativeDriftBand): string {
  switch (band) {
    case "low":
      return "text-emerald-700";
    case "moderate":
      return "text-amber-700";
    case "high":
      return "text-red-700";
  }
}

function barColor(band: NarrativeDriftBand): string {
  switch (band) {
    case "low":
      return "from-emerald-500 to-emerald-400";
    case "moderate":
      return "from-amber-500 to-amber-400";
    case "high":
      return "from-red-600 to-red-400";
  }
}

export default function NarrativeDriftGauge({
  score,
  band,
  label,
  manipulationRisk,
}: NarrativeDriftGaugeProps) {
  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b border-[rgba(0,0,0,0.06)] px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Section 4
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">Narrative Drift Score</h2>
      </div>

      <div className="grid gap-8 p-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-raised"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 327} 327`}
              className={bandColor(band)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold tabular-nums ${bandColor(band)}`}>
              {score}%
            </span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className={`text-xl font-bold ${bandColor(band)}`}>{label}</p>
            {manipulationRisk && (
              <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-surface-raised px-3 py-1 text-xs font-bold uppercase tracking-wide text-text-body">
                {manipulationRisk} manipulation risk
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Measures how far the current viral narrative has drifted from the image&apos;s
            original documented context.
          </p>

          <div className="mt-6">
            <div className="h-3 overflow-hidden rounded-full bg-surface-raised">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${barColor(band)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-text-muted">
              <span>0%</span>
              <span>Low drift</span>
              <span>High manipulation</span>
              <span>100%</span>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-text-muted">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              0–34% Low Context Drift
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              35–69% Moderate Context Drift
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              70–100% High Context Manipulation Risk
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
