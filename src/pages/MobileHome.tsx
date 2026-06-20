import { Link } from "react-router-dom";
import Icon3D, { type Icon3DName } from "../components/Icon3D";
import WhatsHappening from "../components/WhatsHappening";
import { useHaptic } from "../hooks/useHaptic";

const TOOLS: { to: string; icon: Icon3DName; tile: string; label: string; desc: string }[] = [
  { to: "/stress", icon: "mic", tile: "blue", label: "Voice notes", desc: "Transcribe & fact-check" },
  { to: "/screenshot", icon: "camera", tile: "pink", label: "Screenshots", desc: "Read & verify text" },
  { to: "/call", icon: "search", tile: "lilac", label: "Context Trace", desc: "Reused / old media" },
  { to: "/detective", icon: "eye", tile: "mint", label: "Detective", desc: "Spot deepfakes" },
  { to: "/trust-map", icon: "pin", tile: "butter", label: "Confusion Map", desc: "Local rumors" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeHub() {
  const haptic = useHaptic();

  return (
    <div className="nt-shazam">
      {/* Centered Shazam hero */}
      <section className="nt-shazam-hero">
        <p className="text-[14px] font-semibold text-white/85">{greeting()}, Fatima 👋</p>
        <h1 className="nt-3d-text text-[36px] font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
          NomaeTrust
        </h1>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">
          Rumor → Reality → Action
        </p>

        <Link
          to="/stress"
          className="nt-orb-wrap nt-press my-1"
          aria-label="Tap to verify"
          onClick={() => haptic("medium")}
        >
          <span className="nt-orb-ring nt-orb-ring--light nt-orb-ring--1" aria-hidden />
          <span className="nt-orb-ring nt-orb-ring--light nt-orb-ring--2" aria-hidden />
          <span className="nt-orb-ring nt-orb-ring--light nt-orb-ring--3" aria-hidden />
          <span className="nt-orb nt-orb--glass">
            <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.04A11.96 11.96 0 0 1 3.6 6 12 12 0 0 0 3 9.75c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.31-.21-2.57-.6-3.75h-.15a11.96 11.96 0 0 1-8.25-3.29Z" />
            </svg>
            <span className="text-[16px] font-black tracking-wide">Tap to Verify</span>
          </span>
        </Link>
        <p className="text-[13px] font-medium text-white/85">Drop a voice note, screenshot, or photo</p>
      </section>

      {/* Tools — translucent glass on the gradient */}
      <section>
        <h2 className="mb-3 px-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/75">
          Verification tools
        </h2>
        <div className="nt-stagger grid grid-cols-2 gap-3">
          {TOOLS.map((tool, i) => (
            <Link
              key={tool.to}
              to={tool.to}
              onClick={() => haptic("light")}
              className={`nt-gcard nt-press flex flex-col gap-1 p-4 ${i === TOOLS.length - 1 ? "col-span-2 flex-row items-center gap-3" : ""}`}
            >
              <span className={`nt-tile nt-tile--${tool.tile}`} style={{ width: 52, height: 52 }} aria-hidden>
                <Icon3D name={tool.icon} />
              </span>
              <span className={i === TOOLS.length - 1 ? "flex flex-col" : "mt-2 flex flex-col"}>
                <span className="text-[15px] font-bold text-white">{tool.label}</span>
                <span className="text-[12px] text-white/75">{tool.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <WhatsHappening glass />

      <Link to="/disclosure" className="text-center text-[12px] font-semibold text-white/75 underline">
        How NomaeTrust uses AI responsibly
      </Link>
    </div>
  );
}
