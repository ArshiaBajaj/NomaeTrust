import { Link } from "react-router-dom";

type FeatureType = "action" | "screenshot" | "call" | "map";

type FeaturePreviewCardProps = {
  type: FeatureType;
  label: string;
  description: string;
  to: string;
};

function CheckmarkBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent ${className}`}
    >
      <svg
        className="h-2.5 w-2.5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </span>
  );
}

function ActionCardMockup() {
  const steps = ["Call Atlanta Food Bank", "Check official website", "Ask a validator"];
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Action Card
        </span>
        <CheckmarkBadge />
      </div>
      <p className="text-[11px] leading-relaxed text-slate-600">
        Someone said the food bank closed. We didn&apos;t find proof — verify before you change plans.
      </p>
      <ul className="mt-3 flex-1 space-y-2">
        {steps.map((step) => (
          <li key={step} className="flex items-start gap-2 text-[10px] text-slate-600">
            <span className="text-emerald-500">☐</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-[10px] font-semibold text-emerald-700">
        Share on WhatsApp
      </div>
    </div>
  );
}

function ScreenshotMockup() {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          OCR Scan
        </span>
        <CheckmarkBadge />
      </div>
      <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(43,92,230,0.08)_50%,transparent_100%)]" />
        <div className="p-3 space-y-2">
          <div className="h-2 w-3/4 rounded bg-slate-200" />
          <div className="h-2 w-full rounded bg-slate-200" />
          <div className="h-2 w-5/6 rounded bg-accent/30 ring-1 ring-accent/40" />
          <div className="h-2 w-2/3 rounded bg-slate-200" />
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1.5 backdrop-blur-sm">
          <CheckmarkBadge className="h-3 w-3 [&_svg]:h-1.5 [&_svg]:w-1.5" />
          <span className="text-[9px] text-slate-600">Claim detected</span>
        </div>
      </div>
    </div>
  );
}

function CallMockup() {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Incoming call
        </span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-600">
          Live
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-[#EEF2F8] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0" />
          </svg>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-700">Unknown caller</p>
        <div className="mt-3 flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
          <span className="text-[9px] text-slate-500">Deepfake risk</span>
          <span className="text-[9px] font-bold text-red-500">78%</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <CheckmarkBadge className="h-3 w-3 [&_svg]:h-1.5 [&_svg]:w-1.5" />
          <span className="text-[9px] font-semibold text-slate-600">No passport match</span>
        </div>
      </div>
    </div>
  );
}

function MapMockup() {
  const hotspots = [65, 40, 85, 55, 72, 48];
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Confusion Map
        </span>
        <CheckmarkBadge />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {hotspots.map((h, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-end rounded-lg bg-[#EEF2F8] p-2"
          >
            <div
              className="w-full rounded-t-sm bg-accent/70"
              style={{ height: `${h * 0.5}px` }}
            />
            <span className="mt-1 text-[8px] text-slate-400">Zone {i + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px]">
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckmarkBadge className="h-3 w-3 [&_svg]:h-1.5 [&_svg]:w-1.5" />
          12 verified
        </span>
        <span className="text-red-500 font-semibold">8 flagged</span>
      </div>
    </div>
  );
}

const mockups: Record<FeatureType, () => React.ReactNode> = {
  action: ActionCardMockup,
  screenshot: ScreenshotMockup,
  call: CallMockup,
  map: MapMockup,
};

export default function FeaturePreviewCard({
  type,
  label,
  description,
  to,
}: FeaturePreviewCardProps) {
  const Mockup = mockups[type];

  return (
    <Link to={to} className="group block">
      <div className="h-[340px] overflow-hidden rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-[#EEF2F8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-shadow duration-200 group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
        <Mockup />
      </div>
      <p className="mt-4 text-left text-[15px] leading-relaxed">
        <span className="font-bold text-[#111827]">{label}</span>{" "}
        <span className="font-normal text-[#6B7280]">{description}</span>
      </p>
    </Link>
  );
}
