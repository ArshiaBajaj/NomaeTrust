import type { EvidenceCard } from "../types";
import {
  getConfidenceTierLabel,
  outcomeTheme,
} from "./VerificationConfidenceGauge";
import { resolveVerificationConfidence } from "../utils/verificationConfidence";

type ExtractedClaimSectionProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
  extractionNote?: string;
};

export default function ExtractedClaimSection({
  card,
  extractionNote = "This claim was automatically extracted from the voice note.",
}: ExtractedClaimSectionProps) {
  const verification = resolveVerificationConfidence(card);
  const theme = outcomeTheme(verification.outcome);

  return (
    <section className="nt-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="nt-kicker">Extracted claim</p>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${theme.badge}`}>
          {verification.outcomeLabel}
        </span>
      </div>

      <p className="mt-3 text-[18px] font-extrabold leading-snug text-ink">{card.claim}</p>

      <p className="mt-2 text-[12px] text-muted">{extractionNote}</p>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
        <span className="text-[13px] font-semibold text-body">Confidence in assessment</span>
        <span className="flex items-center gap-2">
          <span className={`text-[15px] font-extrabold tabular-nums ${theme.accent}`}>
            {verification.score}%
          </span>
          <span className={`text-[12px] font-bold ${theme.accent}`}>
            {getConfidenceTierLabel(verification.tier)}
          </span>
        </span>
      </div>
    </section>
  );
}
