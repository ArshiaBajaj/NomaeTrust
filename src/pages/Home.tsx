import { Link } from "react-router-dom";
import { ROUTES } from "../config/navigation";
import FeaturePreviewCard from "../components/FeaturePreviewCard";
import Hero from "../components/Hero";

const features = [
  {
    type: "news" as const,
    label: "News Watch.",
    description:
      "Share from Apple News or paste headlines — outlet tiers, fact-checks, and Action Cards.",
    to: ROUTES.newsWatch,
  },
  {
    type: "action" as const,
    label: "Action Cards.",
    description:
      "Upload a scary voice note and get plain-language next steps you can share on WhatsApp.",
    to: ROUTES.actionCards,
  },
  {
    type: "screenshot" as const,
    label: "Screenshot verification.",
    description:
      "OCR forwarded images, detect claims, and surface Action Cards in seconds.",
    to: ROUTES.screenshots,
  },
  {
    type: "trace" as const,
    label: "Context Trace.",
    description:
      "Trace reused images across time — detect when old photos support false modern claims.",
    to: ROUTES.contextTrace,
  },
  {
    type: "detective" as const,
    label: "Digital Detective.",
    description:
      "Swipe through mystery clips — spot deepfakes, earn XP, and train your media forensics instincts.",
    to: ROUTES.detective,
  },
  {
    type: "map" as const,
    label: "Confusion Map.",
    description:
      "See where rumors spread, report claims, and route urgent items to human validators.",
    to: ROUTES.confusionMap,
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <section id="features" className="features-section px-6 pt-20 pb-[100px] lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[600px] text-center">
            <h2 className="font-serif text-[2.75rem] font-normal leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <span className="text-[#0D1B2A]">Two portals, </span>
              <span className="font-normal italic text-[#9CA3AF]">
                one trust layer
              </span>
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-[#6B7280] sm:text-lg">
              Platforms gate content before it spreads; individuals focus on the major
              claims that affect their community.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to={ROUTES.loginIndividual}
              className="audience-card audience-card--individual block text-left"
            >
              <span className="audience-card-icon" aria-hidden>👤</span>
              <h3 className="audience-card-title">For individuals</h3>
              <p className="audience-card-desc">
                Major claims, News Watch, Action Cards, and the Confusion Map — built
                for families verifying what matters.
              </p>
            </Link>
            <Link
              to={ROUTES.loginPlatform}
              className="audience-card audience-card--platform block text-left"
            >
              <span className="audience-card-icon" aria-hidden>🏢</span>
              <h3 className="audience-card-title">For platforms</h3>
              <p className="audience-card-desc">
                Pre-publish review API so Reddit, Discord, and publishers decide what
                goes live — with evidence, not auto-moderation.
              </p>
            </Link>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeaturePreviewCard key={feature.type} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
