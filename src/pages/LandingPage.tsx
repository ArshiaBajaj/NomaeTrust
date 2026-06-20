import { Link } from "react-router-dom";
import { ROUTES } from "../config/navigation";
import { useHaptic } from "../hooks/useHaptic";
import { usePortalLayout } from "../hooks/usePortalLayout";

const HIGHLIGHTS = [
  {
    icon: "📋",
    title: "Action Cards",
    text: "Plain-language next steps — not TRUE/FALSE labels.",
  },
  {
    icon: "🏢",
    title: "Publish gate",
    text: "Platforms review content before it goes live.",
  },
  {
    icon: "🕵️",
    title: "Digital Detective",
    text: "Train your eye to spot deepfakes before they spread.",
  },
] as const;

export default function LandingPage() {
  const haptic = useHaptic();
  const { isMobile, shell, content } = usePortalLayout();

  return (
    <div className={`${shell} landing-page`}>
      <div className={`mx-auto max-w-3xl ${content} ${isMobile ? "pt-10 pb-16" : "pt-20 pb-24"}`}>
        <header className="landing-hero text-center">
          <div className="landing-logo" aria-hidden>
            <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <p className="landing-tagline">Rumor → Reality → Action</p>
          <h1 className={`landing-title ${isMobile ? "text-4xl" : "text-6xl"}`}>NomaeTrust</h1>
          <p className="landing-subtitle">
            When panic spreads faster than truth, NomaeTrust turns viral rumors into verified
            Action Cards, outlet context, and community signal — for families and platforms alike.
          </p>
        </header>

        <section className="landing-highlights">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="landing-highlight-card">
              <span className="landing-highlight-icon" aria-hidden>{item.icon}</span>
              <div>
                <p className="landing-highlight-title">{item.title}</p>
                <p className="landing-highlight-text">{item.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="landing-portals">
          <h2 className="landing-portals-label">Choose your portal</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to={ROUTES.loginIndividual}
              className="audience-card audience-card--individual text-left"
              onClick={() => haptic("light")}
            >
              <span className="audience-card-icon" aria-hidden>👤</span>
              <h3 className="audience-card-title">For individuals</h3>
              <p className="audience-card-desc">
                Families and neighbors verifying major claims, headlines, and voice notes in
                your community.
              </p>
              <span className="audience-card-cta">Sign in →</span>
            </Link>

            <Link
              to={ROUTES.loginPlatform}
              className="audience-card audience-card--platform text-left"
              onClick={() => haptic("light")}
            >
              <span className="audience-card-icon" aria-hidden>🏢</span>
              <h3 className="audience-card-title">For companies</h3>
              <p className="audience-card-desc">
                Reddit mods, Discord admins, and publishers routing content through the publish
                gate before it goes live.
              </p>
              <span className="audience-card-cta">Sign in →</span>
            </Link>
          </div>
        </section>

        <p className="landing-footnote text-center">
          <Link to={ROUTES.disclosure} className="text-accent hover:underline">
            How NomaeTrust works
          </Link>
        </p>
      </div>
    </div>
  );
}
