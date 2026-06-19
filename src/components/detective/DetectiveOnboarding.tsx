type DetectiveOnboardingProps = {
  onComplete: () => void;
};

const STEPS = [
  {
    icon: "🛡️",
    title: "Protect your circle",
    body: "Families forward scary clips on WhatsApp every day. Train your eye to spot fakes before they spread.",
  },
  {
    icon: "👆",
    title: "Swipe to judge",
    body: "Swipe LEFT if manipulated · Swipe RIGHT if verified. One motion — like sorting evidence.",
  },
  {
    icon: "🔬",
    title: "Learn the tells",
    body: "After each case, AI shows exactly what failed — blink patterns, lip sync, lighting. You get sharper every round.",
  },
];

export default function DetectiveOnboarding({ onComplete }: DetectiveOnboardingProps) {
  return (
    <div className="detective-onboarding">
      <div className="detective-onboarding-card">
        <p className="detective-onboarding-kicker">Digital Detective</p>
        <h2 className="detective-onboarding-headline">Spot deepfakes before they go viral</h2>
        <ul className="detective-onboarding-steps">
          {STEPS.map((step) => (
            <li key={step.title}>
              <span className="detective-onboarding-step-icon">{step.icon}</span>
              <div>
                <p className="detective-onboarding-step-title">{step.title}</p>
                <p className="detective-onboarding-step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="detective-btn-next" onClick={onComplete}>
          START FIRST CASE
        </button>
      </div>
    </div>
  );
}
