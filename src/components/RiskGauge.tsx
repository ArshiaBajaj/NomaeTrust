type RiskGaugeProps = {
  score: number;
  label?: string;
};

export default function RiskGauge({
  score,
  label = "Misinformation Risk Score",
}: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const rotation = (clamped / 100) * 180 - 90;

  const color =
    clamped >= 70
      ? { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-500/10 ring-red-500/30" }
      : clamped >= 40
        ? { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10 ring-amber-500/30" }
        : { stroke: "#22c55e", text: "text-emerald-400", bg: "bg-emerald-500/10 ring-emerald-500/30" };

  const level =
    clamped >= 70 ? "HIGH" : clamped >= 40 ? "MODERATE" : "LOW";

  return (
    <div className="flex flex-col items-center">
      <span className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="relative h-24 w-44">
        <svg viewBox="0 0 120 70" className="h-full w-full">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={color.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(clamped / 100) * 157} 157`}
            className="transition-all duration-1000 ease-out"
          />
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "60px 60px",
              transition: "transform 1s ease-out",
            }}
          >
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="22"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="60" cy="60" r="4" fill="#94a3b8" />
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className={`font-mono text-2xl font-bold tabular-nums ${color.text}`}>
            {clamped}
          </span>
        </div>
      </div>
      <span
        className={`mt-1 rounded-full px-3 py-0.5 text-xs font-bold tracking-widest ring-1 ${color.bg} ${color.text}`}
      >
        {level} RISK
      </span>
    </div>
  );
}
