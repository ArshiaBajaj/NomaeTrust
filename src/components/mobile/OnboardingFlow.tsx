import { useState } from "react";
import { useHaptic } from "../../hooks/useHaptic";

type OnboardingFlowProps = {
  onComplete: () => void;
};

const SLIDES = [
  {
    icon: "🛡️",
    title: "Verify before you panic",
    body: "Upload voice notes, screenshots, or images. NomaeTrust checks Atlanta trusted sources and tells you what to do next.",
  },
  {
    icon: "🕵️",
    title: "Train your eye",
    body: "Digital Detective teaches you to spot manipulated clips with swipe-based challenges — like a game, not a lecture.",
  },
  {
    icon: "📍",
    title: "See community confusion",
    body: "The Confusion Map shows where rumors are spreading and links every pin to an Action Card with real next steps.",
  },
] as const;

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

  const skip = () => {
    haptic("light");
    onComplete();
  };

  return (
    <div className="mobile-onboarding">
      <div className="mobile-onboarding-skip">
        <button type="button" className="ios-text-btn" onClick={skip}>
          Skip
        </button>
      </div>

      <div className="mobile-onboarding-body" key={index}>
        <div className="mobile-onboarding-icon" aria-hidden>
          {slide.icon}
        </div>
        <h2 className="mobile-onboarding-title">{slide.title}</h2>
        <p className="mobile-onboarding-text">{slide.body}</p>
      </div>

      <div className="mobile-onboarding-footer">
        <div className="mobile-onboarding-dots" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`mobile-onboarding-dot ${i === index ? "mobile-onboarding-dot--active" : ""}`}
            />
          ))}
        </div>
        <button type="button" className="ios-btn ios-btn-primary" onClick={advance}>
          {isLast ? "Get Started" : "Continue"}
        </button>
      </div>
    </div>
  );
}
