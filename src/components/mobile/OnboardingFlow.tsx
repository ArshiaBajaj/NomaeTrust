import { useState } from "react";
import Icon3D, { type Icon3DName } from "../Icon3D";
import { useHaptic } from "../../hooks/useHaptic";

type OnboardingFlowProps = { onComplete: () => void };

const SLIDES: { icon: Icon3DName; tint: string; title: string; body: string }[] = [
  {
    icon: "shield",
    tint: "var(--grad-blue)",
    title: "Verify before you panic",
    body: "Drop a forwarded voice note, screenshot, or photo. NomaeTrust checks trusted local sources and tells you what to do next.",
  },
  {
    icon: "eye",
    tint: "var(--grad-lilac)",
    title: "Train your eye",
    body: "Digital Detective turns spotting manipulated clips into a quick swipe game — learn the tells, earn streaks.",
  },
  {
    icon: "pin",
    tint: "var(--grad-pink)",
    title: "See the confusion map",
    body: "Watch where rumors spread in your area, and route urgent ones to community validators for a real answer.",
  },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [index, setIndex] = useState(0);
  const haptic = useHaptic();
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const advance = () => {
    haptic("light");
    if (isLast) {
      haptic("success");
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div
      className="relative flex min-h-full flex-1 flex-col overflow-hidden px-6 pb-9 text-white"
      style={{ paddingTop: "max(20px, env(safe-area-inset-top))", background: "var(--grad-brand)" }}
    >
      <span className="nt-blob" style={{ width: 240, height: 240, top: -50, right: -40, background: "#ffd36e" }} />
      <span className="nt-blob" style={{ width: 220, height: 220, bottom: 80, left: -50, background: "#8fe3c6" }} />

      <div className="relative flex justify-end">
        <button
          type="button"
          className="rounded-full px-3 py-1.5 text-sm font-bold text-white/85"
          onClick={() => {
            haptic("light");
            onComplete();
          }}
        >
          Skip
        </button>
      </div>

      <div key={index} className="relative flex flex-1 flex-col items-center justify-center gap-6 text-center" style={{ animation: "nt-enter 0.4s ease" }}>
        <span
          className="nt-tile"
          style={{ width: 124, height: 124, background: slide.tint, boxShadow: "0 28px 54px -18px rgba(50,46,77,0.55)" }}
          aria-hidden
        >
          <Icon3D name={slide.icon} />
        </span>
        <h2 className="max-w-[16ch] text-[30px] font-extrabold leading-tight tracking-tight">{slide.title}</h2>
        <p className="max-w-[30ch] text-[15px] leading-relaxed text-white/90">{slide.body}</p>
      </div>

      <div className="relative flex flex-col items-center gap-5">
        <div className="flex gap-2" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 22 : 8,
                background: i === index ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={advance}
          className="nt-btn nt-btn-block"
          style={{ background: "#fff", color: "var(--color-blue-deep)", boxShadow: "0 16px 32px -12px rgba(50,46,77,0.45)" }}
        >
          {isLast ? "Get started" : "Continue"}
        </button>
      </div>
    </div>
  );
}
