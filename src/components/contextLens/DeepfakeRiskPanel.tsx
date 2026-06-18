import type { DeepfakeAssessment } from "../../types/contextLens";

const RISK_STYLES = {
  low: {
    bar: "bg-success",
    text: "text-success",
    border: "border-success/30 bg-success/5",
    label: "Low synthetic risk",
  },
  medium: {
    bar: "bg-amber-500",
    text: "text-amber-700",
    border: "border-amber-500/30 bg-amber-500/5",
    label: "Elevated synthetic risk",
  },
  high: {
    bar: "bg-secondary",
    text: "text-secondary",
    border: "border-secondary/30 bg-secondary/5",
    label: "High deepfake risk",
  },
};

const MANIPULATION_LABELS: Record<DeepfakeAssessment["manipulationType"], string> = {
  none: "No manipulation indicators",
  ai_generated: "AI-generated image signals",
  face_swap: "Possible face swap",
  compositing: "Possible compositing",
  metadata_mismatch: "Metadata / context mismatch",
  uncertain: "Uncertain — needs review",
};

type DeepfakeRiskPanelProps = {
  assessment?: DeepfakeAssessment;
  syncedToMap?: boolean;
};

export default function DeepfakeRiskPanel({ assessment, syncedToMap }: DeepfakeRiskPanelProps) {
  if (!assessment) return null;

  const pct = Math.round(assessment.deepfakeRiskScore * 100);
  const styles = RISK_STYLES[assessment.riskBand];

  return (
    <section className={`rounded-xl border p-4 ${styles.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
            Deepfake scan
          </h2>
          <p className={`mt-1 text-sm font-semibold ${styles.text}`}>{styles.label}</p>
        </div>
        <span className={`font-mono text-2xl font-bold ${styles.text}`}>{pct}%</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)]">
        <div
          className={`h-full rounded-full transition-all ${styles.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-[11px] font-semibold text-navy">
        {MANIPULATION_LABELS[assessment.manipulationType]}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-body">{assessment.analysis}</p>

      {assessment.artifacts.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {assessment.artifacts.map((artifact) => (
            <li key={artifact} className="flex gap-2 text-[11px] text-text-body">
              <span className="text-secondary">•</span>
              <span>{artifact}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-text-body">
        {assessment.recommendation}
      </p>

      {syncedToMap && (
        <p className="mt-3 text-[10px] font-semibold text-secondary">
          Tracked on Community Confusion Map — high-risk synthetic media alert
        </p>
      )}
    </section>
  );
}
