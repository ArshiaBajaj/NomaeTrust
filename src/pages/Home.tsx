import FeaturePreviewCard from "../components/FeaturePreviewCard";
import Hero from "../components/Hero";

const features = [
  {
    type: "voice" as const,
    label: "Voice Verification.",
    description:
      "Transcribe and analyze voice notes, then extract verifiable claims automatically.",
    to: "/voice",
  },
  {
    type: "screenshot" as const,
    label: "Screenshot Verification.",
    description:
      "Run OCR on images, detect claims, and surface evidence cards in seconds.",
    to: "/screenshot",
  },
  {
    type: "call" as const,
    label: "Call Verification.",
    description:
      "Match callers to voice passports and score deepfake risk before you respond.",
    to: "/call",
  },
  {
    type: "map" as const,
    label: "Community Trust Map.",
    description:
      "Visualize misinformation hotspots and coordinate community reporting.",
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
              <span className="text-[#0D1B2A]">Four layers of </span>
              <span className="font-normal italic text-[#9CA3AF]">
                verification
              </span>
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-[#6B7280] sm:text-lg">
              Protect people and organizations from impersonation, deepfakes,
              and viral misinformation.
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
