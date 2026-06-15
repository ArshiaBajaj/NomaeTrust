import type { PipelineStep } from "../types";

type PipelineStepsProps = {
  steps: PipelineStep[];
};

export default function PipelineSteps({ steps }: PipelineStepsProps) {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="relative flex flex-1 items-center gap-3 sm:flex-col sm:gap-2 sm:text-center"
        >
          {index > 0 && (
            <div
              aria-hidden
              className="absolute -left-3 top-4 hidden h-px w-6 bg-white/10 sm:-top-3 sm:left-1/2 sm:block sm:h-6 sm:w-px"
            />
          )}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              step.status === "complete"
                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                : step.status === "active"
                  ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30 animate-pulse"
                  : step.status === "error"
                    ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                    : "bg-white/5 text-zinc-500 ring-1 ring-white/10"
            }`}
          >
            {step.status === "complete" ? "✓" : index + 1}
          </span>
          <span
            className={`text-sm ${
              step.status === "active"
                ? "font-medium text-white"
                : step.status === "complete"
                  ? "text-zinc-300"
                  : "text-zinc-500"
            }`}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
