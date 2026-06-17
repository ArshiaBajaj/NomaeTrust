import { Link } from "react-router-dom";
import type { EvidenceCard } from "../types";

type ActionCardPanelProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
};

export default function ActionCardPanel({
  card,
  variant = "light",
}: ActionCardPanelProps) {
  const isDark = variant === "dark";
  const steps = card.actionSteps ?? [];
  const avoid = card.doNotDo ?? [];

  if (steps.length === 0 && !card.plainLanguageSummary) return null;

  const box = isDark
    ? "rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-5"
    : "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6";

  return (
    <section className={box}>
      <p
        className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
      >
        Action Card — What to do now
      </p>

      {card.valuesBridge && (
        <p className={`mt-3 text-sm italic ${isDark ? "text-slate-300" : "text-text-body"}`}>
          {card.valuesBridge}
        </p>
      )}

      {card.plainLanguageSummary && (
        <p className={`mt-3 text-base font-medium leading-relaxed ${isDark ? "text-white" : "text-navy"}`}>
          {card.plainLanguageSummary}
        </p>
      )}

      {steps.length > 0 && (
        <div className="mt-4">
          <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-text-muted"}`}>
            Do this now
          </p>
          <ul className="mt-2 space-y-2">
            {steps.map((step) => (
              <li
                key={step}
                className={`flex gap-2 text-sm ${isDark ? "text-slate-200" : "text-text-body"}`}
              >
                <span className="text-emerald-500">☐</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {avoid.length > 0 && (
        <div className="mt-4">
          <p className={`text-xs font-semibold uppercase ${isDark ? "text-amber-400" : "text-secondary"}`}>
            Do not do yet
          </p>
          <ul className="mt-2 space-y-2">
            {avoid.map((item) => (
              <li
                key={item}
                className={`flex gap-2 text-sm ${isDark ? "text-amber-100" : "text-secondary"}`}
              >
                <span>✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {card.primaryActionUrl && (
          <a
            href={card.primaryActionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            {card.primaryActionLabel ?? "Open official source"}
          </a>
        )}
        <a href="tel:211" className="btn-secondary text-sm">
          Call 211
        </a>
        <Link to="/trust-map" className="btn-secondary text-sm">
          Ask validator
        </Link>
      </div>
    </section>
  );
}
