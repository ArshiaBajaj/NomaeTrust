import { Link } from "react-router-dom";
import { ROUTES } from "../config/navigation";
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

      <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center px-6 pt-36 text-center sm:pt-40">
        <p className="rounded-full border border-black/10 bg-white/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-black/70">
          Rumor → Reality → Action
        </p>

        <h1 className="mt-6 font-serif text-[2.5rem] font-medium leading-[1.12] tracking-tight text-black sm:text-5xl lg:text-[3.5rem]">
          From confusion to clarity — then action.
        </h1>

        <p className="mx-auto mt-6 max-w-[640px] text-center text-base font-light leading-relaxed text-black/85 sm:text-lg">
          At 2 a.m., Fatima gets a frantic WhatsApp voice note: &ldquo;The food bank
          closed — don&apos;t go.&rdquo; NomaeTrust turns rumors into Action Cards with
          plain-language next steps, multilingual sharing, and Context Trace for
          reused images taken out of context.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link to={ROUTES.loginIndividual} className="btn-primary w-full sm:w-auto">
            Sign in — individuals
          </Link>
          <Link to={ROUTES.loginPlatform} className="btn-secondary w-full sm:w-auto">
            Sign in — companies
          </Link>
        </div>
      </div>

      <ProductPreview />
    </section>
  );
}
