import type { EvidenceCard, VerificationOutcome } from "../types";
import {
  getConfidenceTierLabel,
  resolveVerificationConfidence,
  ASSESSMENT_CONFIDENCE_DISCLAIMER,
} from "../utils/verificationConfidence";

type VerificationConfidenceGaugeProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
};

/** Pastel theme tokens per verification outcome. */
export function outcomeTheme(outcome: VerificationOutcome) {
  switch (outcome) {
    case "verified":
      return {
        accent: "text-mint",
        badge: "bg-mint-soft text-mint",
        tile: "nt-tile--mint",
        bar: "var(--grad-mint)",
        emoji: "✅",
      };
    case "not_verified":
      return {
        accent: "text-pink-deep",
        badge: "bg-pink-soft text-pink-deep",
        tile: "nt-tile--pink",
        bar: "var(--grad-pink)",
        emoji: "⚠️",
      };
    case "inconclusive":
    default:
      return {
        accent: "text-yellow-deep",
        badge: "bg-yellow-soft text-yellow-deep",
        tile: "nt-tile--butter",
        bar: "var(--grad-butter)",
        emoji: "🔍",
      };
  }
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
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
}: VerificationConfidenceGaugeProps) {
  const verification = resolveVerificationConfidence(card);
  const theme = outcomeTheme(verification.outcome);

  return (
    <section className="nt-card p-5">
      <p className="nt-kicker">Verification result</p>

      <div className="mt-4 flex items-start gap-3">
        <span className={`nt-tile ${theme.tile}`} aria-hidden>
          {theme.emoji}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${theme.badge}`}>
              {verification.outcomeLabel}
            </span>
            <span className={`text-xs font-bold ${theme.accent}`}>
              ({getConfidenceTierLabel(verification.tier)})
            </span>
          </div>
          <p className={`mt-2 text-[15px] font-extrabold leading-snug ${theme.accent}`}>
            {verification.headline}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="relative h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${verification.score}%`, background: theme.bar }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-muted">
          <span>0%</span>
          <span>Confidence in assessment · {verification.score}%</span>
          <span>100%</span>
        </div>
      </div>

      <p className="mt-3 text-[13px] font-medium leading-relaxed text-ink">
        {verification.evidenceStatement}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-body">{verification.summary}</p>
      <p className="mt-3 rounded-2xl bg-surface-2 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
        {ASSESSMENT_CONFIDENCE_DISCLAIMER}
      </p>
    </section>
  );
}

export function ConfidenceShieldIcon({
  outcome,
  size = "sm",
}: {
  outcome: VerificationOutcome;
  variant?: "dark" | "light";
  size?: "sm" | "lg";
}) {
  const theme = outcomeTheme(outcome);
  return (
    <span className={`nt-tile ${theme.tile} ${size === "lg" ? "" : "shrink-0"}`} style={size === "sm" ? { width: 36, height: 36 } : undefined} aria-hidden>
      <ShieldIcon className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
    </span>
  );
}

export { getConfidenceTierLabel, ASSESSMENT_CONFIDENCE_DISCLAIMER };
