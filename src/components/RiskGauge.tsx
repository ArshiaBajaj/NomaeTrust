type RiskGaugeProps = {
  score: number;
  label?: string;
};

export default function RiskGauge({
  score,
  label = "Misinformation risk",
}: RiskGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const rotation = (clamped / 100) * 180 - 90;

  const theme =
    clamped >= 70
      ? { stroke: "#ff7a8a", text: "text-danger", chip: "bg-pink-soft text-pink-deep" }
      : clamped >= 40
        ? { stroke: "#ffc23f", text: "text-yellow-deep", chip: "bg-yellow-soft text-yellow-deep" }
        : { stroke: "#6fcf9f", text: "text-success", chip: "bg-mint-soft text-mint" };

  const level = clamped >= 70 ? "HIGH" : clamped >= 40 ? "MODERATE" : "LOW";

  return (
    <div className="flex flex-col items-center">
      <span className="nt-kicker mb-2">{label}</span>
      <div className="relative h-24 w-44">
        <svg viewBox="0 0 120 70" className="h-full w-full">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={theme.stroke}
            strokeWidth="9"
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
            <line x1="60" y1="60" x2="60" y2="24" stroke="#9b97b6" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="60" r="4.5" fill="#9b97b6" />
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className={`text-2xl font-extrabold tabular-nums ${theme.text}`}>{clamped}</span>
        </div>
      </div>
      <span className={`mt-1 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-widest ${theme.chip}`}>
        {level} RISK
      </span>
    </div>
  );
}
