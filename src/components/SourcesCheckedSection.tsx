import type { EvidenceCard } from "../types";

type SourcesCheckedSectionProps = {
  card: EvidenceCard;
  variant?: "dark" | "light";
};

export default function SourcesCheckedSection({ card }: SourcesCheckedSectionProps) {
  const refs = card.sourceReferences ?? [];
  const fallbackSources = card.sources.filter(
    (source) => source !== "Demo Mode" && source !== "OpenAI Whisper" && source !== "GPT-4o-mini",
  );
  const hasSources = refs.length > 0 || fallbackSources.length > 0;

  if (!hasSources) return null;

  return (
    <section className="nt-card p-5">
      <p className="nt-kicker">Sources checked</p>
      <p className="mt-1.5 text-[13px] text-muted">
        Trusted sources cross-referenced before generating your Action Card.
      </p>

      {refs.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {refs.map((source) => (
            <li
              key={`${source.url}-${source.title}`}
              className="rounded-2xl bg-surface-2 px-4 py-3"
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-bold text-blue-deep hover:underline"
              >
                {source.title} ↗
              </a>
              <p className="mt-0.5 text-[11px] font-semibold text-muted">{source.date}</p>
              {source.snippet && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-body">{source.snippet}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {fallbackSources.map((source) => (
            <li key={source} className="nt-chip">
              {source}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
