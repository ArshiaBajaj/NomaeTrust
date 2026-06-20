const SIZES = {
  sm: 32,
  md: 40,
  lg: 52,
  xl: 64,
  hero: 80,
} as const;

type LogoSize = keyof typeof SIZES;

type NomaeTrustLogoProps = {
  variant?: "full" | "icon";
  size?: LogoSize;
  height?: number;
  className?: string;
  onDark?: boolean;
};

export default function NomaeTrustLogo({
  variant = "full",
  size,
  height,
  className = "",
  onDark = false,
}: NomaeTrustLogoProps) {
  const px = height ?? (size ? SIZES[size] : SIZES.md);
  const src = variant === "icon" ? "/logo-icon.png" : "/logo.png";

  const img = (
    <img
      src={src}
      alt="NomaeTrust"
      className={className}
      style={{
        height: px,
        width: variant === "icon" ? px : "auto",
        maxWidth: variant === "full" ? "min(90vw, 360px)" : px,
        display: "block",
        objectFit: "contain",
      }}
      draggable={false}
      decoding="async"
    />
  );

  if (!onDark) return img;

  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl bg-white/96 px-3 py-2 shadow-sm"
      style={{ boxShadow: "0 8px 32px -10px rgba(50,46,77,0.3)" }}
    >
      {img}
    </span>
  );
}
