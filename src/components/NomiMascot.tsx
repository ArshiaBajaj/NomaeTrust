/** Nomi — NomaeTrust's friendly shield mascot (Duolingo-style character). */
export default function NomiMascot({
  size = 76,
  className,
  mood = "happy",
}: {
  size?: number;
  className?: string;
  mood?: "happy" | "sad";
}) {
  return (
    <svg
      className={className}
      width={size}
      height={(size * 132) / 120}
      viewBox="0 0 120 132"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="nomi-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fa6f6" />
          <stop offset="0.5" stopColor="#b9a8f2" />
          <stop offset="1" stopColor="#ff9db8" />
        </linearGradient>
      </defs>

      {/* shield body */}
      <path
        d="M60 6 106 24v40c0 30-20 52-46 60C34 116 14 94 14 64V24Z"
        fill="url(#nomi-body)"
      />
      {/* glossy top highlight */}
      <path d="M60 6 106 24v18c-14-8-30-12-46-12S28 34 14 42V24Z" fill="#fff" opacity="0.18" />

      {/* eyes */}
      <ellipse cx="45" cy="58" rx="12" ry="14" fill="#fff" />
      <ellipse cx="75" cy="58" rx="12" ry="14" fill="#fff" />
      <circle cx="48" cy="60" r="5.6" fill="#2a2640" />
      <circle cx="72" cy="60" r="5.6" fill="#2a2640" />
      <circle cx="46" cy="57.5" r="1.9" fill="#fff" />
      <circle cx="70" cy="57.5" r="1.9" fill="#fff" />

      {/* cheeks */}
      <circle cx="35" cy="74" r="5" fill="#ff9db8" opacity="0.65" />
      <circle cx="85" cy="74" r="5" fill="#ff9db8" opacity="0.65" />

      {/* mouth */}
      {mood === "sad" ? (
        <path d="M50 86q10 -9 20 0" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M50 80q10 10 20 0" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}
