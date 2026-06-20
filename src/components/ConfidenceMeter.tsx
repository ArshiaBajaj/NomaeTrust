type ConfidenceMeterProps = {
  value: number;
  label?: string;
  animated?: boolean;
};

export default function ConfidenceMeter({
  value,
  label = "Extraction confidence",
  animated = true,
}: ConfidenceMeterProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value * 100)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="nt-kicker">{label}</span>
        <span className="text-[15px] font-extrabold tabular-nums text-ink">{pct}%</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${animated ? "transition-all duration-1000 ease-out" : ""}`}
          style={{ width: `${pct}%`, background: "var(--grad-blue)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-muted">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>
    </div>
  );
}
