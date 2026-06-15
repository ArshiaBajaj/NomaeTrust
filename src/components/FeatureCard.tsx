import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  bullets: string[];
  accent: "indigo" | "violet" | "blue" | "emerald";
  to: string;
};

const accentStyles = {
  indigo: {
    ring: "ring-indigo-500/20",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    glow: "group-hover:shadow-indigo-500/10",
  },
  violet: {
    ring: "ring-violet-500/20",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    glow: "group-hover:shadow-violet-500/10",
  },
  blue: {
    ring: "ring-blue-500/20",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "group-hover:shadow-blue-500/10",
  },
  emerald: {
    ring: "ring-emerald-500/20",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/10",
  },
};

export default function FeatureCard({
  icon,
  title,
  bullets,
  accent,
  to,
}: FeatureCardProps) {
  const styles = accentStyles[accent];

  return (
    <Link
      to={to}
      className={`group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:shadow-2xl ${styles.glow}`}
    >
      <div
        className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${styles.bg} ${styles.ring}`}
      >
        <span className={styles.text}>{icon}</span>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>

      <ul className="mt-4 flex flex-col gap-3">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-3 text-sm leading-relaxed text-zinc-400"
          >
            <svg
              className={`mt-0.5 h-4 w-4 shrink-0 ${styles.text}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            {bullet}
          </li>
        ))}
      </ul>

      <span
        className={`mt-6 inline-flex items-center gap-1 text-sm font-medium ${styles.text}`}
      >
        Open demo
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </span>
    </Link>
  );
}
