import { useState } from "react";
import NomaeTrustLogo from "../NomaeTrustLogo";
import { useHaptic } from "../../hooks/useHaptic";

type DetectiveOnboardingProps = {
  onComplete: () => void;
};

const STEPS = [
  {
    icon: "🛡️",
    grad: "var(--grad-blue)",
    title: "Protect your circle",
    body: "Families forward scary clips on WhatsApp every day. Train your eye to spot fakes before they spread.",
  },
  {
    icon: "👆",
    grad: "var(--grad-pink)",
    title: "Swipe to judge",
    body: "Swipe LEFT if manipulated · Swipe RIGHT if verified. One motion — like sorting evidence.",
  },
  {
    icon: "🔬",
    grad: "var(--grad-mint)",
    title: "Learn the tells",
    body: "After each case, AI shows exactly what failed — blink patterns, lip sync, lighting. You get sharper every round.",
  },
];

export default function DetectiveOnboarding({ onComplete }: DetectiveOnboardingProps) {
  const haptic = useHaptic();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const active = STEPS[step];

  const advance = () => {
    haptic("light");
    if (isLast) {
      haptic("success");
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-6 py-10"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(130% 80% at 50% -10%, #eef0ff 0%, #f5eefc 50%, #f6f5fd 100%)",
        color: "#322e4d",
      }}
    >
      <div
        className="flex w-full max-w-sm flex-col items-center text-center"
        style={{
          borderRadius: 32,
          padding: "32px 26px 26px",
          background: "#ffffff",
          border: "1px solid rgba(50,46,77,0.08)",
          boxShadow: "0 16px 36px -18px rgba(50,46,77,0.22)",
        }}
      >
        <div className="mb-3 flex justify-center">
          <NomaeTrustLogo size="sm" />
        </div>
        <p
          className="mb-1 text-[11px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "#5a76e0" }}
        >
          Digital Detective
        </p>
        <h2
          className="mb-7 text-[22px] font-extrabold leading-tight"
          style={{ letterSpacing: "-0.01em" }}
        >
          Spot deepfakes before they go viral
        </h2>

        <div
          className="mb-5 flex h-24 w-24 items-center justify-center text-5xl"
          style={{
            borderRadius: 28,
            background: active.grad,
            boxShadow: "0 18px 40px -16px rgba(143,166,246,0.7)",
          }}
        >
          {active.icon}
        </div>

        <p className="mb-1 text-lg font-bold">{active.title}</p>
        <p
          className="mb-7 text-sm leading-relaxed"
          style={{ color: "#5d5980" }}
        >
          {active.body}
        </p>

        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              style={{
                height: 6,
                width: i === step ? 22 : 6,
                borderRadius: 999,
                background: i === step ? "#6e8bf0" : "rgba(50,46,77,0.14)",
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={advance}
          className="nt-press w-full text-sm font-bold uppercase tracking-wide"
          style={{
            borderRadius: 18,
            padding: "16px",
            border: "none",
            color: "#15132b",
            background: "var(--grad-butter)",
            boxShadow: "0 16px 34px -16px rgba(255,211,110,0.85)",
          }}
        >
          {isLast ? "Start first case" : "Next"}
        </button>
      </div>
    </div>
  );
}
