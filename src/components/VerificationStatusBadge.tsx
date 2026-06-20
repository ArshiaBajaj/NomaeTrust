type VerificationStatusBadgeProps = {
  label: string;
  size?: "sm" | "lg";
};

const themes: Record<string, { chip: string; dot: string }> = {
  verified: { chip: "bg-mint-soft text-mint", dot: "bg-mint" },
  unverified: { chip: "bg-pink-soft text-pink-deep", dot: "bg-pink-deep" },
  disputed: { chip: "bg-yellow-soft text-yellow-deep", dot: "bg-yellow-deep" },
  pending: { chip: "bg-surface-2 text-muted", dot: "bg-muted" },
  needs: { chip: "bg-yellow-soft text-yellow-deep", dot: "bg-yellow-deep animate-pulse" },
};

function getTheme(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("verified") && !lower.includes("needs")) return themes.verified;
  if (lower.includes("needs")) return themes.needs;
  if (lower.includes("unverified")) return themes.unverified;
  if (lower.includes("disputed")) return themes.disputed;
  return themes.pending;
}

export default function VerificationStatusBadge({
  label,
  size = "lg",
}: VerificationStatusBadgeProps) {
  const theme = getTheme(label);

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-2xl ${theme.chip} ${
        size === "lg" ? "px-4 py-3" : "px-3 py-2"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] opacity-70">
          Verification status
        </p>
        <p className={`font-extrabold uppercase tracking-wide ${size === "lg" ? "text-sm" : "text-xs"}`}>
          {label}
        </p>
      </div>
    </div>
  );
}
