type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-2",
};

export default function LoadingSpinner({
  label,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`animate-spin rounded-full border-[rgba(15,23,42,0.08)] border-t-accent ${sizeClasses[size]}`}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
