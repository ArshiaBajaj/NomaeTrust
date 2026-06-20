import type { PipelineStep } from "../types";

type PipelineStepsProps = {
  steps: PipelineStep[];
};

export default function PipelineSteps({ steps }: PipelineStepsProps) {
  const completedCount = steps.filter((s) => s.status === "complete").length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="nt-kicker">Analysis pipeline</span>
        <span className="text-[11px] font-extrabold tabular-nums text-muted">
          {completedCount}/{steps.length}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: "var(--grad-blue)" }}
        />
      </div>

      <ol className="relative flex flex-col gap-3 pl-1">
        {steps.map((step, index) => {
          const isComplete = step.status === "complete";
          const isActive = step.status === "active";
          const isError = step.status === "error";
          const last = index === steps.length - 1;

          const node = isComplete
            ? "text-white"
            : isActive
              ? "text-white"
              : isError
                ? "text-white"
                : "text-muted";

          const nodeBg = isComplete
            ? "var(--grad-mint)"
            : isActive
              ? "var(--grad-blue)"
              : isError
                ? "var(--grad-pink)"
                : "var(--color-surface-2)";

          return (
            <li key={step.id} className="relative flex items-center gap-3">
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5 rounded-full ${
                    isComplete ? "bg-mint" : "bg-line"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${node} ${
                  isActive ? "animate-pulse" : ""
                }`}
                style={{ background: nodeBg }}
              >
                {isComplete ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : isError ? (
                  "!"
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-[14px] leading-tight transition-colors ${
                  isActive
                    ? "font-bold text-ink"
                    : isComplete
                      ? "font-semibold text-body"
                      : isError
                        ? "font-semibold text-pink-deep"
                        : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
