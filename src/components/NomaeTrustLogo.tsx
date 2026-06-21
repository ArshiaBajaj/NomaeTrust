const SIZES = {
  sm: 48,
  md: 64,
  lg: 84,
  xl: 100,
  hero: 120,
} as const;

type LogoSize = keyof typeof SIZES;

type NomaeTrustLogoProps = {
  size?: LogoSize;
  height?: number;
  className?: string;
  /** Show the "NomaeTrust" wordmark under the mark. Default true. */
  withWordmark?: boolean;
  /** @deprecated Ignored — wordmark color follows currentColor automatically. */
  onDark?: boolean;
};

/**
 * NomaeTrust brand mark — crisp vector (transparent background, theme-aware
 * wordmark via currentColor). Replaces the old raster /logo.png.
 *
 * A gradient "trust ring" with pixels dispersing into it (rumor → verified),
 * over the NomaeTrust wordmark.
 */
export default function NomaeTrustLogo({
  size,
  height,
  className = "",
  withWordmark = true,
}: NomaeTrustLogoProps) {
  const h = height ?? (size ? SIZES[size] : SIZES.md);
  // Square lockup when wordmark shown; just the mark otherwise.
  const vbW = 120;
  const vbH = withWordmark ? 120 : 86;
  const w = h * (vbW / vbH);

  // dispersing pixels feeding into the ring (x, y, side, opacity)
  const pixels: [number, number, number, number][] = [
    [44, 38, 10, 0.95],
    [33, 31, 8, 0.8],
    [33, 47, 7, 0.7],
    [23, 39, 7, 0.58],
    [15, 31, 5.5, 0.42],
    [15, 48, 5, 0.36],
    [7, 40, 4.5, 0.26],
  ];

  return (
    <svg
      className={className}
      width={w}
      height={h}
      viewBox={`0 0 ${vbW} ${vbH}`}
      fill="none"
      role="img"
      aria-label="NomaeTrust"
      style={{ display: "block", maxWidth: "min(92vw, 360px)" }}
    >
      <defs>
        <linearGradient id="nt-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6e8bf0" />
          <stop offset="0.5" stopColor="#b9a8f2" />
          <stop offset="1" stopColor="#ff9db8" />
        </linearGradient>
      </defs>

      {/* dispersing pixels */}
      {pixels.map(([x, y, s, o], i) => (
        <rect
          key={i}
          x={x}
          y={y - s / 2}
          width={s}
          height={s}
          rx={s * 0.22}
          fill="url(#nt-logo-grad)"
          opacity={o}
        />
      ))}

      {/* trust ring (torus) */}
      <circle cx="82" cy="42" r="22" fill="none" stroke="url(#nt-logo-grad)" strokeWidth="11" strokeLinecap="round" />
      {/* soft inner highlight */}
      <circle cx="82" cy="42" r="22" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />

      {withWordmark && (
        <text
          x="60"
          y="104"
          textAnchor="middle"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontSize="19"
          fontWeight="800"
          letterSpacing="-0.5"
          fill="currentColor"
        >
          NomaeTrust
        </text>
      )}
    </svg>
  );
}
