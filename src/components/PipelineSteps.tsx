import type { PipelineStep } from "../types";

type PipelineStepsProps = {
  steps: PipelineStep[];
};

export default function PipelineSteps({ steps }: PipelineStepsProps) {
  const completedCount = steps.filter((s) => s.status === "complete").length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium uppercase tracking-widest text-slate-400">
          AI Analysis Pipeline
        </span>
        <span className="font-mono text-slate-500">
          {completedCount}/{steps.length} complete
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => {
          const isComplete = step.status === "complete";
          const isActive = step.status === "active";
          const isError = step.status === "error";

          return (
            <li
              key={step.id}
              className={`relative rounded-lg border px-3 py-3 transition-all duration-500 ${
                isComplete
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isActive
                    ? "border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                    : isError
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-slate-700/50 bg-slate-900/30"
              } ${isActive ? "animate-pulse-subtle" : ""}`}
            >
              {index < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-slate-700 sm:block"
                />
              )}

              <div className="flex items-center gap-2 sm:flex-col sm:gap-2 sm:text-center">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                    isComplete
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                      : isActive
                        ? "bg-blue-500/25 text-blue-300 ring-1 ring-blue-400/50"
                        : isError
                          ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                          : "bg-slate-800 text-slate-500 ring-1 ring-slate-700"
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-xs leading-tight transition-colors duration-300 ${
                    isActive
                      ? "font-semibold text-white"
                      : isComplete
                        ? "text-slate-300"
                        : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
