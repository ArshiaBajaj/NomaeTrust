type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export default function LoadingSpinner({
  label = "Processing…",
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div
        className={`animate-spin rounded-full border-indigo-500/30 border-t-indigo-400 ${sizeClasses[size]}`}
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}
