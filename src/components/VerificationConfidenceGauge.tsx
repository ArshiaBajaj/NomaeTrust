import type { EvidenceCard } from "../types";
import {
  getOutcomeAccentText,
  getOutcomeBadgeClasses,
  getOutcomeBarColor,
  getOutcomeShieldClasses,
  getConfidenceTierLabel,
  resolveVerificationConfidence,
  ASSESSMENT_CONFIDENCE_DISCLAIMER,
} from "../utils/verificationConfidence";

type VerificationConfidenceGaugeProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
};

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

export default function VerificationConfidenceGauge({
  card,
  variant = "light",
}: VerificationConfidenceGaugeProps) {
  const isDark = variant === "dark";
  const verification = resolveVerificationConfidence(card);
  const accent = getOutcomeAccentText(verification.outcome, variant);

  const box = isDark
    ? "rounded-xl border border-slate-600/40 bg-slate-800/30 p-5"
    : "rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-5";

  return (
    <section className={box}>
      <p
        className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-text-muted"}`}
      >
        Verification Result
      </p>

      <div className="mt-4 grid gap-5 lg:grid-cols-[auto_1fr_minmax(180px,220px)] lg:items-center">
        <div className={getOutcomeShieldClasses(verification.outcome, variant, "lg")}>
          <ShieldIcon className="h-7 w-7" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={getOutcomeBadgeClasses(verification.outcome, variant)}>
              {verification.outcomeLabel}
            </span>
            <span className={`text-xs font-medium ${accent}`}>
              ({getConfidenceTierLabel(verification.tier)})
            </span>
          </div>
          <p className={`mt-3 text-base font-bold leading-snug tracking-tight sm:text-lg ${accent}`}>
            {verification.headline}
          </p>
          <p
            className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-text-muted"}`}
          >
            {ASSESSMENT_CONFIDENCE_DISCLAIMER}
          </p>
          <p className={`mt-2 text-sm font-medium ${isDark ? "text-slate-100" : "text-navy"}`}>
            {verification.evidenceStatement}
          </p>
          <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-text-body"}`}>
            {verification.summary}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${getOutcomeBarColor(verification.outcome)}`}
              style={{ width: `${verification.score}%` }}
            />
          </div>
          <div className={`flex justify-between text-[10px] ${isDark ? "text-slate-500" : "text-text-muted"}`}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-text-muted"}`}>
            Confidence in verification assessment
          </p>
        </div>
      </div>
    </section>
  );
}

export function ConfidenceShieldIcon({
  outcome,
  variant = "light",
  size = "sm",
}: {
  outcome: ReturnType<typeof resolveVerificationConfidence>["outcome"];
  variant?: "dark" | "light";
  size?: "sm" | "lg";
}) {
  return (
    <div className={getOutcomeShieldClasses(outcome, variant, size)}>
      <ShieldIcon className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
    </div>
  );
}

export { getConfidenceTierLabel, ASSESSMENT_CONFIDENCE_DISCLAIMER };
