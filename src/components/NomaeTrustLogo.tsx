const SIZES = {
  sm: 48,
  md: 64,
  lg: 84,
  xl: 100,
  hero: 120,
} as const;

type LogoSize = keyof typeof SIZES;

/** NomaeTrust brand mark — single asset (`/logo.png`) used everywhere. */
type NomaeTrustLogoProps = {
  size?: LogoSize;
  height?: number;
  className?: string;
  /** @deprecated Ignored — kept for call-site compatibility. */
  onDark?: boolean;
};

/** Square wordmark (1024×1024 source). */
const LOGO_ASPECT = 1;

export default function NomaeTrustLogo({
  size,
  height,
  className = "",
}: NomaeTrustLogoProps) {
  const h = height ?? (size ? SIZES[size] : SIZES.md);

  return (
    <img
      src="/logo.png"
      alt="NomaeTrust"
      className={className}
      style={{
        height: h,
        width: h * LOGO_ASPECT,
        maxWidth: "min(92vw, 320px)",
        display: "block",
        objectFit: "contain",
      }}
      draggable={false}
      decoding="async"
    />
  );
}
