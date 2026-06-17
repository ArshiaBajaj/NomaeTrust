import type { PipelineStep } from "../types";

type PipelineStepsProps = {
  steps: PipelineStep[];
};

function stepStyles(status: PipelineStep["status"]) {
  switch (status) {
    case "complete":
      return "border-accent/30 bg-accent/10 text-accent";
    case "active":
      return "border-accent bg-accent text-white";
    case "error":
      return "border-secondary/30 bg-secondary/10 text-secondary";
    default:
      return "border-[rgba(0,0,0,0.1)] bg-surface-raised text-text-muted";
  }
}

export default function PipelineSteps({ steps }: PipelineStepsProps) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="relative flex flex-1 items-center gap-3 sm:flex-col sm:gap-2.5 sm:text-center"
        >
          {index > 0 && (
            <div
              aria-hidden
              className="absolute -left-3 top-4 hidden h-px w-6 bg-[rgba(0,0,0,0.08)] sm:-top-3 sm:left-1/2 sm:block sm:h-6 sm:w-px"
            />
          )}
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${stepStyles(step.status)}`}
          >
            {step.status === "complete" ? "✓" : index + 1}
          </span>
          <span
            className={`text-sm ${
              step.status === "active"
                ? "font-semibold text-navy"
                : "text-text-muted"
            }`}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
