import FeaturePreviewCard from "../components/FeaturePreviewCard";
import Hero from "../components/Hero";

const features = [
  {
    type: "action" as const,
    label: "Action Cards.",
    description:
      "Upload a scary voice note and get plain-language next steps you can share on WhatsApp.",
    to: "/stress",
  },
  {
    type: "screenshot" as const,
    label: "Screenshot verification.",
    description:
      "OCR forwarded images, detect claims, and surface Action Cards in seconds.",
    to: "/screenshot",
  },
  {
    type: "trace" as const,
    label: "Context Trace.",
    description:
      "Trace reused images across time — detect when old photos support false modern claims.",
    to: "/call",
  },
  {
    type: "map" as const,
    label: "Community Confusion Map.",
    description:
      "See where rumors spread, report claims, and route urgent items to human validators.",
    to: "/trust-map",
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
              <span className="text-[#0D1B2A]">Four tools for </span>
              <span className="font-normal italic text-[#9CA3AF]">
                stressed families
              </span>
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-[#6B7280] sm:text-lg">
              From confusion to clarity to action — verify rumors, calls, and
              screenshots before harm spreads.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeaturePreviewCard key={feature.type} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
