import { useEffect, useState } from "react";

const COLORS = ["#6e8bf0", "#ff9db8", "#ffd36e", "#b9a8f2", "#8fe3c6", "#ff5a6e"];

/**
 * A lightweight CSS confetti burst. Re-fires whenever `trigger` changes to a
 * truthy value; auto-clears after the animation. Respects reduced-motion.
 * Parent must be position:relative for the burst to fill it.
 */
export default function Confetti({ trigger, pieces = 30 }: { trigger: unknown; pieces?: number }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    const t = window.setTimeout(() => setOn(false), 1700);
    return () => window.clearTimeout(t);
  }, [trigger]);

  if (!on) return null;

  return (
    <div className="nt-confetti" aria-hidden>
      {Array.from({ length: pieces }).map((_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 36 + (i % 5) * 7) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 8) * 0.05}s`,
            animationDuration: `${1.1 + (i % 6) * 0.16}s`,
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
