import type { EvidenceCard } from "../types";

type SourcesCheckedSectionProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
};

export default function SourcesCheckedSection({
  card,
  variant = "light",
}: SourcesCheckedSectionProps) {
  const isDark = variant === "dark";
  const refs = card.sourceReferences ?? [];
  const fallbackSources = card.sources.filter(
    (source) => source !== "Demo Mode" && source !== "OpenAI Whisper" && source !== "GPT-4o-mini",
  );
  const hasSources = refs.length > 0 || fallbackSources.length > 0;

  if (!hasSources) return null;

  const box = isDark
    ? "rounded-xl border border-slate-600/40 bg-slate-800/30 p-5"
    : "rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-5";

  return (
    <section className={box}>
      <p
        className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-text-muted"}`}
      >
        Sources Checked
      </p>
      <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-text-muted"}`}>
        Trusted sources cross-referenced before generating your Action Card.
      </p>

      {refs.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {refs.map((source) => (
            <li
              key={`${source.url}-${source.title}`}
              className={`rounded-lg border px-4 py-3 ${
                isDark
                  ? "border-slate-700/50 bg-slate-900/40"
                  : "border-[rgba(0,0,0,0.06)] bg-surface"
              }`}
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-semibold hover:underline ${
                  isDark ? "text-blue-300" : "text-accent"
                }`}
              >
                {source.title} ↗
              </a>
              <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-text-muted"}`}>
                {source.date}
              </p>
              {source.snippet && (
                <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-text-body"}`}>
                  {source.snippet}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {fallbackSources.map((source) => (
            <li
              key={source}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                isDark
                  ? "border-slate-600 bg-slate-900/50 text-slate-300"
                  : "border-[rgba(0,0,0,0.08)] bg-surface text-text-body"
              }`}
            >
              {source}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
