import { useState } from "react";

const COLLAPSE_THRESHOLD = 240;

type WhatWeHeardSectionProps = {
  transcript: string;
  variant?: "dark" | "light";
  title?: string;
};

export default function WhatWeHeardSection({
  transcript,
  variant = "light",
  title = "What We Heard",
}: WhatWeHeardSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const isDark = variant === "dark";
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

  const box = isDark
    ? "rounded-xl border border-blue-500/30 bg-blue-500/10 p-5"
    : "rounded-xl border border-blue-500/25 bg-blue-50 p-5";

  return (
    <section className={box}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p
          className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-blue-300" : "text-blue-700"}`}
        >
          {title}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            isDark
              ? "border-slate-600 bg-slate-800/80 text-slate-200 hover:border-blue-400/40 hover:text-white"
              : "border-[rgba(0,0,0,0.08)] bg-white text-text-body hover:border-blue-300"
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
          {copyFeedback ?? "Copy transcript"}
        </button>
      </div>

      <blockquote
        className={`mt-4 border-l-4 pl-4 text-base leading-relaxed italic ${
          isDark
            ? "border-blue-400/60 text-slate-100"
            : "border-blue-400 text-navy"
        }`}
      >
        &ldquo;{displayText}&rdquo;
      </blockquote>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`mt-3 text-sm font-semibold underline ${
            isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-800"
          }`}
        >
          {expanded ? "Show less" : "Show full transcript"}
        </button>
      )}
    </section>
  );
}
