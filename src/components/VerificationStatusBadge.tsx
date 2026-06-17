type VerificationStatusBadgeProps = {
  label: string;
  size?: "sm" | "lg";
};

const statusThemes: Record<string, { ring: string; bg: string; text: string; dot: string }> = {
  verified: {
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  unverified: {
    ring: "ring-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-300",
    dot: "bg-red-400",
  },
  disputed: {
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  pending: {
    ring: "ring-slate-500/40",
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    dot: "bg-slate-400",
  },
  needs: {
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
  },
};

function getTheme(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("verified") && !lower.includes("needs")) return statusThemes.verified;
  if (lower.includes("needs")) return statusThemes.needs;
  if (lower.includes("unverified")) return statusThemes.unverified;
  if (lower.includes("disputed")) return statusThemes.disputed;
  return statusThemes.pending;
}

export default function VerificationStatusBadge({
  label,
  size = "lg",
}: VerificationStatusBadgeProps) {
  const theme = getTheme(label);

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-lg border border-slate-700/50 ring-1 ${theme.ring} ${theme.bg} ${
        size === "lg" ? "px-4 py-2.5" : "px-3 py-1.5"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Verification Status
        </p>
        <p
          className={`font-semibold uppercase tracking-wide ${theme.text} ${
            size === "lg" ? "text-sm" : "text-xs"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
