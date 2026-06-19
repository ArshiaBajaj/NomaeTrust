import type { ContextTraceVerdict, ExifMetadata, ManipulationRiskLevel } from "../../types/contextTrace";

type ContextTraceVerdictCardProps = {
  verdict: ContextTraceVerdict;
  exif: ExifMetadata;
};

function riskColor(risk: ManipulationRiskLevel): string {
  switch (risk) {
    case "Low":
      return "text-emerald-700 bg-emerald-500/10 border-emerald-500/25";
    case "Medium":
      return "text-amber-700 bg-amber-500/10 border-amber-500/25";
    case "High":
      return "text-red-700 bg-red-500/10 border-red-500/25";
  }
}

function verdictColor(label: ContextTraceVerdict["label"]): string {
  switch (label) {
    case "Authentic":
      return "text-emerald-700 bg-emerald-500/10 border-emerald-500/25";
    case "Reused Media":
      return "text-amber-700 bg-amber-500/10 border-amber-500/25";
    case "Out of Context":
      return "text-orange-700 bg-orange-500/10 border-orange-500/25";
    case "Misleading":
      return "text-red-700 bg-red-500/10 border-red-500/25";
  }
}

export default function ContextTraceVerdictCard({
  verdict,
  exif,
}: ContextTraceVerdictCardProps) {
  return (
    <section className="card overflow-hidden border-accent/20 p-0">
      <div className="border-b border-[rgba(0,0,0,0.06)] bg-accent/5 px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Section 5
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">Context Trace Verdict</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${verdictColor(verdict.label)}`}
          >
            {verdict.label}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${riskColor(verdict.manipulationRisk)}`}
          >
            {verdict.manipulationRisk} Manipulation Risk
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {verdict.statuses.map((status) => (
            <span
              key={status}
              className="rounded-full border border-[rgba(0,0,0,0.08)] bg-surface-raised px-3 py-1 text-xs font-semibold text-text-body"
            >
              {status}
            </span>
          ))}
        </div>

        <p className="mt-5 text-base font-medium leading-relaxed text-navy">
          {verdict.summary}
        </p>

        <div className="mt-4 rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Explanation
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-body">{verdict.explanation}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Confidence
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-700">
              {verdict.confidence}%
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              EXIF metadata
            </p>
            <p className="mt-1 text-sm font-medium text-navy">
              {exif.found ? "Found in uploaded file" : "Not found — stripped on re-upload"}
            </p>
            {exif.captured && (
              <p className="mt-1 text-xs text-text-muted">Captured: {exif.captured}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
