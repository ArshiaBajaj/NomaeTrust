import { Link } from "react-router-dom";
import ProductPreview from "./ProductPreview";

function MountainSilhouettes() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full opacity-[0.18]"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 400 L0 280 L120 220 L240 260 L380 180 L520 240 L680 160 L840 220 L1000 150 L1160 210 L1320 170 L1440 230 L1440 400 Z"
        fill="#3d5a73"
      />
      <path
        d="M0 400 L0 310 L200 270 L400 300 L600 250 L800 290 L1000 240 L1200 280 L1440 260 L1440 400 Z"
        fill="#2d4a63"
        opacity="0.7"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="hero-section hero-gradient relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <MountainSilhouettes />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[700px] flex-col items-center px-6 pt-36 text-center sm:pt-40">
        <h1 className="font-serif text-[2.75rem] font-medium leading-[1.1] tracking-tight text-black sm:text-6xl lg:text-[4.25rem]">
          Verify before harm spreads.
        </h1>

        <p className="mx-auto mt-6 max-w-[600px] text-center text-base font-light italic leading-relaxed text-black sm:text-lg">
          NomaeTrust helps you verify voices, claims, and trust signals
          <br />
          so you can act on facts, not fraud.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link to="/voice" className="btn-primary w-full sm:w-auto">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8.5v8.5H3V3zm10.5 0H22v8.5h-8.5V3zM3 12.5h8.5V21H3v-8.5zm10.5 0H22V21h-8.5v-8.5z" />
            </svg>
            Start verification
          </Link>
          <a href="#features" className="btn-secondary w-full sm:w-auto">
            View capabilities
          </a>
        </div>
      </div>

      <ProductPreview />
    </section>
  );
}
