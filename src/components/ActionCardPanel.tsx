import { Link } from "react-router-dom";
import type { EvidenceCard } from "../types";
import { resolveVerificationConfidence } from "../utils/verificationConfidence";
import { outcomeTheme } from "./VerificationConfidenceGauge";

type ActionCardPanelProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
};

export default function ActionCardPanel({ card }: ActionCardPanelProps) {
  const steps = card.actionSteps ?? [];
  const avoid = card.doNotDo ?? [];
  const verification = resolveVerificationConfidence(card);
  const theme = outcomeTheme(verification.outcome);

  if (steps.length === 0 && !card.plainLanguageSummary) return null;

  return (
    <section
      className="overflow-hidden rounded-[28px] p-5 text-white"
      style={{ background: "var(--grad-mint)", boxShadow: "var(--shadow-soft)" }}
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/90">
        Action Card — what to do now
      </p>

      <div className="mt-3 rounded-2xl bg-white/85 px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${theme.badge}`}>
          {verification.outcomeLabel}
        </span>
        <p className={`mt-2 text-[14px] font-bold leading-snug ${theme.accent}`}>
          {verification.headline}
        </p>
      </div>

      {card.valuesBridge && (
        <p className="mt-3 text-[14px] italic leading-relaxed text-white/95">{card.valuesBridge}</p>
      )}

      {card.plainLanguageSummary && (
        <p className="mt-3 text-[15px] font-semibold leading-relaxed text-white">
          {card.plainLanguageSummary}
        </p>
      )}

      {steps.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white/85 p-4">
          <p className="nt-kicker text-ink/70">Do this now</p>
          <ul className="mt-2 flex flex-col gap-2">
            {steps.map((step) => (
              <li key={step} className="flex gap-2 text-[14px] text-ink">
                <span className="text-mint">●</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {avoid.length > 0 && (
        <div className="mt-3 rounded-2xl bg-white/85 p-4">
          <p className="nt-kicker text-pink-deep">Do not do yet</p>
          <ul className="mt-2 flex flex-col gap-2">
            {avoid.map((item) => (
              <li key={item} className="flex gap-2 text-[14px] text-pink-deep">
                <span>✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        {card.primaryActionUrl && (
          <a
            href={card.primaryActionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nt-btn nt-press"
            style={{ background: "#fff", color: "var(--color-blue-deep)", padding: "11px 18px", fontSize: 14 }}
          >
            {card.primaryActionLabel ?? "Open official source"}
          </a>
        )}
        <a
          href="tel:211"
          className="nt-btn nt-press"
          style={{ background: "rgba(255,255,255,0.25)", color: "#fff", padding: "11px 18px", fontSize: 14 }}
        >
          Call 211
        </a>
        <Link
          to="/trust-map"
          className="nt-btn nt-press"
          style={{ background: "rgba(255,255,255,0.25)", color: "#fff", padding: "11px 18px", fontSize: 14 }}
        >
          Ask validator
        </Link>
      </div>
    </section>
  );
}
