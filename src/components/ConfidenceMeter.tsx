type ConfidenceMeterProps = {
  value: number;
  label?: string;
  animated?: boolean;
};

export default function ConfidenceMeter({
  value,
  label = "Extraction Confidence",
  animated = true,
}: ConfidenceMeterProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value * 100)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-white tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700/50">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-400 ${
            animated ? "transition-all duration-1000 ease-out" : ""
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-white/20 blur-sm ${
            animated ? "transition-all duration-1000 ease-out" : ""
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>
    </div>
  );
}
