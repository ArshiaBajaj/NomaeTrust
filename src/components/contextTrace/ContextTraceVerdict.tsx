import type {
  ContextTraceVerdict,
  ExifMetadata,
  ManipulationRiskLevel,
} from "../../types/contextTrace";

type ContextTraceVerdictCardProps = {
  verdict: ContextTraceVerdict;
  exif: ExifMetadata;
};

type Theme = { bg: string; text: string };

function riskTheme(risk: ManipulationRiskLevel): Theme {
  switch (risk) {
    case "Low":
      return { bg: "var(--color-mint-soft)", text: "#2f9e78" };
    case "Medium":
      return { bg: "var(--color-yellow-soft)", text: "#a87a14" };
    case "High":
      return { bg: "var(--color-pink-soft)", text: "#d24668" };
  }
}

function verdictTheme(label: ContextTraceVerdict["label"]): Theme & { grad: string } {
  switch (label) {
    case "Authentic":
      return { bg: "var(--color-mint-soft)", text: "#2f9e78", grad: "var(--grad-mint)" };
    case "Reused Media":
      return { bg: "var(--color-yellow-soft)", text: "#a87a14", grad: "var(--grad-butter)" };
    case "Out of Context":
      return { bg: "var(--color-lilac-soft)", text: "#7c5fd6", grad: "var(--grad-lilac)" };
    case "Misleading":
      return { bg: "var(--color-pink-soft)", text: "#d24668", grad: "var(--grad-pink)" };
  }
}

export default function ContextTraceVerdictCard({
  verdict,
  exif,
}: ContextTraceVerdictCardProps) {
  const vTheme = verdictTheme(verdict.label);
  const rTheme = riskTheme(verdict.manipulationRisk);

  return (
    <section className="nt-card relative overflow-hidden p-5">
      <div
        className="nt-blob"
        style={{ width: 150, height: 150, top: -60, right: -50, background: vTheme.grad }}
        aria-hidden
      />

      <div className="relative">
        <p className="nt-kicker">The verdict</p>
        <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink">
          Context Trace Verdict
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide"
            style={{ background: vTheme.bg, color: vTheme.text }}
          >
            {verdict.label}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide"
            style={{ background: rTheme.bg, color: rTheme.text }}
          >
            {verdict.manipulationRisk} risk
          </span>
        </div>

        {verdict.statuses.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {verdict.statuses.map((status) => (
              <span key={status} className="nt-chip">
                {status}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-base font-bold leading-relaxed text-ink">{verdict.summary}</p>

        <div
          className="mt-3 rounded-3xl p-4"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-line)" }}
        >
          <p className="nt-kicker">Explanation</p>
          <p className="mt-2 text-sm leading-relaxed text-body">{verdict.explanation}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-3xl p-4 text-center"
            style={{ background: vTheme.bg }}
          >
            <p className="nt-kicker">Confidence</p>
            <p
              className="mt-1 text-3xl font-extrabold tabular-nums"
              style={{ color: vTheme.text }}
            >
              {verdict.confidence}%
            </p>
          </div>
          <div
            className="rounded-3xl p-4"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-line)" }}
          >
            <p className="nt-kicker">EXIF metadata</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: exif.found ? "var(--color-mint)" : "var(--color-pink-deep)" }}
                aria-hidden
              />
              {exif.found ? "Found" : "Not found"}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              {exif.found
                ? exif.captured
                  ? `Captured ${exif.captured}`
                  : "Present in file"
                : "Stripped on re-upload"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
