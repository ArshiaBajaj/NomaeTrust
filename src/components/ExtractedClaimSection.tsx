import type { EvidenceCard } from "../types";
import {
  ConfidenceShieldIcon,
  getConfidenceTierLabel,
  VERIFICATION_CONFIDENCE_EXPLANATION,
} from "./VerificationConfidenceGauge";
import {
  getConfidenceBadgeClasses,
  getOutcomeAccentText,
  getOutcomeBadgeClasses,
  resolveVerificationConfidence,
} from "../utils/verificationConfidence";

type ExtractedClaimSectionProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
  extractionNote?: string;
};

export default function ExtractedClaimSection({
  card,
  variant = "light",
  extractionNote = "This claim was automatically extracted from the voice note.",
}: ExtractedClaimSectionProps) {
  const isDark = variant === "dark";
  const verification = resolveVerificationConfidence(card);
  const accent = getOutcomeAccentText(verification.outcome, variant);

  const box = isDark
    ? "rounded-xl border border-slate-600/50 bg-slate-800/40 p-5"
    : "rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-5";

  return (
    <section className={box}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p
          className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-text-muted"}`}
        >
          Primary Extracted Claim
        </p>
        <div className="text-right">
          <span className={getOutcomeBadgeClasses(verification.outcome, variant)}>
            {verification.outcomeLabel}
          </span>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            <span
              className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-text-body"}`}
            >
              Verification Confidence:
            </span>
            <span className={getConfidenceBadgeClasses(verification.tier, variant)}>
              {verification.score}%
            </span>
          </div>
          <p className={`mt-1 text-xs font-medium ${accent}`}>
            ({getConfidenceTierLabel(verification.tier)})
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <p
          className={`flex-1 text-lg font-bold leading-snug ${isDark ? "text-white" : "text-navy"}`}
        >
          {card.claim}
        </p>
        <ConfidenceShieldIcon outcome={verification.outcome} variant={variant} />
      </div>

      <p className={`mt-3 text-xs ${isDark ? "text-slate-400" : "text-text-muted"}`}>
        {extractionNote}
      </p>

      <div
        className={`mt-4 flex gap-3 rounded-lg border px-4 py-3 ${
          isDark
            ? "border-slate-700/60 bg-slate-900/40"
            : "border-[rgba(0,0,0,0.06)] bg-surface"
        }`}
      >
        <ConfidenceShieldIcon outcome={verification.outcome} variant={variant} />
        <div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-text-muted"}`}>
            {VERIFICATION_CONFIDENCE_EXPLANATION}
          </p>
          <p className={`mt-1 text-sm font-semibold ${accent}`}>{verification.headline}</p>
          <p
            className={`mt-1 text-sm font-medium ${isDark ? "text-slate-100" : "text-navy"}`}
          >
            {verification.evidenceStatement}
          </p>
        </div>
      </div>
    </section>
  );
}
