import { useState } from "react";

const COLLAPSE_THRESHOLD = 240;

type WhatWeHeardSectionProps = {
  transcript: string;
  variant?: "dark" | "light";
  title?: string;
};

export default function WhatWeHeardSection({
  transcript,
  title = "What we heard",
}: WhatWeHeardSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const isLong = transcript.length > COLLAPSE_THRESHOLD;
  const displayText =
    isLong && !expanded ? `${transcript.slice(0, COLLAPSE_THRESHOLD).trim()}…` : transcript;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopyFeedback("Copied");
    } catch {
      setCopyFeedback("Copy failed");
    }
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <section className="nt-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="nt-tile nt-tile--blue" style={{ width: 36, height: 36, fontSize: 18 }} aria-hidden>
            🎧
          </span>
          <p className="nt-kicker">{title}</p>
        </div>
        <button type="button" onClick={handleCopy} className="nt-chip nt-press">
          {copyFeedback ?? "Copy"}
        </button>
      </div>

      <blockquote
        className="mt-4 rounded-2xl bg-blue-soft px-4 py-3 text-[15px] italic leading-relaxed text-ink"
        style={{ borderLeft: "4px solid var(--color-blue)" }}
      >
        &ldquo;{displayText}&rdquo;
      </blockquote>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-[13px] font-bold text-blue-deep underline"
        >
          {expanded ? "Show less" : "Show full transcript"}
        </button>
      )}
    </section>
  );
}
