import { Link } from "react-router-dom";
import { useHaptic } from "../hooks/useHaptic";

const QUICK_ACTIONS = [
  {
    to: "/stress",
    label: "Action Cards",
    desc: "Verify voice notes",
    icon: "🎤",
    accent: "cyan",
  },
  {
    to: "/screenshot",
    label: "Screenshots",
    desc: "Snap or upload",
    icon: "📸",
    accent: "blue",
  },
  {
    to: "/detective",
    label: "Detective",
    desc: "Spot deepfakes",
    icon: "🕵️",
    accent: "green",
  },
  {
    to: "/trust-map",
    label: "Confusion Map",
    desc: "See local rumors",
    icon: "📍",
    accent: "amber",
  },
  {
    to: "/call",
    label: "Context Trace",
    desc: "Reused media",
    icon: "🔍",
    accent: "violet",
  },
] as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function MobileHome() {
  const haptic = useHaptic();

  return (
    <div className="mobile-screen">
      <header className="mobile-home-hero">
        <p className="mobile-home-greeting">{greeting()}</p>
        <h1 className="mobile-home-title">NomaeTrust</h1>
        <p className="mobile-home-tagline">Rumor → Reality → Action</p>
      </header>

      <section className="mobile-home-section">
        <h2 className="mobile-section-label">Quick actions</h2>
        <div className="mobile-action-grid">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`mobile-action-card mobile-action-card--${action.accent}`}
              onClick={() => haptic("light")}
            >
              <span className="mobile-action-icon" aria-hidden>
                {action.icon}
              </span>
              <span className="mobile-action-label">{action.label}</span>
              <span className="mobile-action-desc">{action.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mobile-home-section">
        <div className="mobile-promo-card">
          <p className="mobile-promo-eyebrow">For families like Fatima&apos;s</p>
          <p className="mobile-promo-text">
            Turn a frantic WhatsApp voice note into a verified Action Card with tap-to-call links
            and shareable evidence.
          </p>
          <Link
            to="/stress"
            className="ios-btn ios-btn-primary ios-btn-sm"
            onClick={() => haptic("light")}
          >
            Try a voice note
          </Link>
        </div>
      </section>
    </div>
  );
}
