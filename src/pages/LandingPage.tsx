import { Link } from "react-router-dom";
import Icon3D from "../components/Icon3D";
import NomaeTrustLogo from "../components/NomaeTrustLogo";
import { ROUTES } from "../config/navigation";
import { useHaptic } from "../hooks/useHaptic";
import { useIsMobile } from "../hooks/useIsMobile";

const HIGHLIGHTS = [
  { icon: "shield" as const, tile: "blue", title: "Action Cards", text: "Plain-language next steps — not TRUE/FALSE labels." },
  { icon: "chip" as const, tile: "lilac", title: "Publish gate", text: "Platforms review content before it goes live." },
  { icon: "eye" as const, tile: "mint", title: "Digital Detective", text: "Train your eye to spot deepfakes before they spread." },
];

export default function LandingPage() {
  const haptic = useHaptic();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="nt-shazam">
        <section className="nt-shazam-hero">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">
            Rumor → Reality → Action
          </p>
          <NomaeTrustLogo size="lg" onDark className="mx-auto" />
          <p className="max-w-[280px] text-[14px] leading-relaxed text-white/85">
            When panic spreads faster than truth, NomaeTrust turns viral rumors into verified Action Cards and
            community signal.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="nt-gcard flex items-center gap-3 p-4">
              <span className={`nt-tile nt-tile--${item.tile}`} style={{ width: 48, height: 48 }} aria-hidden>
                <Icon3D name={item.icon} />
              </span>
              <div>
                <p className="text-[15px] font-bold text-white">{item.title}</p>
                <p className="text-[12px] text-white/75">{item.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 px-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/75">
            Choose your portal
          </h2>
          <div className="grid gap-3">
            <Link
              to={ROUTES.loginIndividual}
              className="nt-gcard nt-press block p-5"
              onClick={() => haptic("light")}
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/70">Individuals</p>
              <h3 className="mt-1 text-[20px] font-black text-white">Families & neighbors</h3>
              <p className="mt-2 text-[13px] text-white/80">
                Verify major claims, headlines, and voice notes in your community.
              </p>
              <span className="mt-3 inline-block text-[13px] font-bold text-white">Sign in →</span>
            </Link>

            <Link
              to={ROUTES.loginPlatform}
              className="nt-gcard nt-press block p-5"
              onClick={() => haptic("light")}
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/70">Companies</p>
              <h3 className="mt-1 text-[20px] font-black text-white">Platforms & publishers</h3>
              <p className="mt-2 text-[13px] text-white/80">
                Route content through the publish gate before it goes live.
              </p>
              <span className="mt-3 inline-block text-[13px] font-bold text-white">Sign in →</span>
            </Link>
          </div>
        </section>

        <Link to={ROUTES.disclosure} className="text-center text-[12px] font-semibold text-white/75 underline">
          How NomaeTrust works
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-16 lg:px-8">
        <div className="nt-shazam overflow-hidden rounded-[32px]">
          <section className="nt-shazam-hero" style={{ minHeight: 360 }}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">Rumor → Reality → Action</p>
            <NomaeTrustLogo size="xl" onDark />
            <p className="max-w-md text-[15px] text-white/85">
              When panic spreads faster than truth, NomaeTrust turns viral rumors into verified Action Cards.
            </p>
          </section>
          <div className="grid gap-3 px-[18px] pb-8 sm:grid-cols-2">
            <Link to={ROUTES.loginIndividual} className="nt-gcard nt-press block p-5" onClick={() => haptic("light")}>
              <h3 className="text-[18px] font-black text-white">For individuals</h3>
              <p className="mt-2 text-[13px] text-white/80">Families verifying major claims and headlines.</p>
            </Link>
            <Link to={ROUTES.loginPlatform} className="nt-gcard nt-press block p-5" onClick={() => haptic("light")}>
              <h3 className="text-[18px] font-black text-white">For companies</h3>
              <p className="mt-2 text-[13px] text-white/80">Publish gate for mods and publishers.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
