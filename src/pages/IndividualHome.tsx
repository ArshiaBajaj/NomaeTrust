import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon3D, { type Icon3DName } from "../components/Icon3D";
import NomaeTrustLogo from "../components/NomaeTrustLogo";
import LoadingSpinner from "../components/LoadingSpinner";
import WhatsHappening from "../components/WhatsHappening";
import { ROUTES } from "../config/navigation";
import { useHaptic } from "../hooks/useHaptic";
import { useIsMobile } from "../hooks/useIsMobile";
import { usePortalAuth } from "../context/PortalAuthContext";
import { fetchMajorClaims } from "../services/majorClaimsApi";
import type { Claim } from "../types";

const TOOLS: { to: string; icon: Icon3DName; tile: string; label: string; desc: string }[] = [
  { to: ROUTES.actionCards, icon: "mic", tile: "blue", label: "Voice notes", desc: "Transcribe & fact-check" },
  { to: ROUTES.screenshots, icon: "camera", tile: "pink", label: "Screenshots", desc: "Read & verify text" },
  { to: ROUTES.contextTrace, icon: "search", tile: "lilac", label: "Context Trace", desc: "Reused / old media" },
  { to: ROUTES.detective, icon: "eye", tile: "mint", label: "Detective", desc: "Spot deepfakes" },
  { to: ROUTES.confusionMap, icon: "pin", tile: "butter", label: "Confusion Map", desc: "Local rumors" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function outcomeLabel(claim: Claim): string {
  if (claim.analysisOutcome === "not_verified") return "May be misleading";
  if (claim.analysisOutcome === "verified") return "Supported by sources";
  if (claim.urgentReview) return "Needs verification";
  return "Under review";
}

export default function IndividualHome() {
  const isMobile = useIsMobile();
  const haptic = useHaptic();
  const { individual } = usePortalAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstName = individual?.displayName?.split(" ")[0] ?? "there";

  useEffect(() => {
    void fetchMajorClaims()
      .then(setClaims)
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed."))
      .finally(() => setLoading(false));
  }, []);

  const hero = (
    <>
      <section className="nt-shazam-hero">
        <p className="text-[14px] font-semibold nt-shazam-body">
          {greeting()}, {firstName} 👋
        </p>
        <NomaeTrustLogo size="lg" />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] nt-shazam-muted">
          Rumor → Reality → Action
        </p>

        <Link
          to={ROUTES.newsWatch}
          className="nt-orb-wrap nt-press my-1"
          aria-label="Verify a headline"
          onClick={() => haptic("medium")}
        >
          <span className="nt-orb-ring nt-orb-ring--light nt-orb-ring--1" aria-hidden />
          <span className="nt-orb-ring nt-orb-ring--light nt-orb-ring--2" aria-hidden />
          <span className="nt-orb-ring nt-orb-ring--light nt-orb-ring--3" aria-hidden />
          <span className="nt-orb nt-orb--glass">
            <NomaeTrustLogo size="md" />
            <span className="text-[16px] font-black tracking-wide nt-shazam-ink">Tap to Verify</span>
          </span>
        </Link>
        <p className="text-[13px] font-medium nt-shazam-body">
          {individual?.city ? `Major claims near ${individual.city}` : "Drop a voice note, screenshot, or headline"}
        </p>
      </section>

      <section>
        <h2 className="nt-shazam-label mb-3 px-1">Verification tools</h2>
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
                <span className="text-[15px] font-bold nt-shazam-ink">{tool.label}</span>
                <span className="text-[12px] nt-shazam-muted">{tool.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="nt-shazam-label mb-0">Major claims</h2>
          <Link to={ROUTES.confusionMap} className="text-[12px] nt-shazam-link" onClick={() => haptic("light")}>
            View map →
          </Link>
        </div>

        {loading && <LoadingSpinner label="Loading major claims…" />}
        {error && (
          <p className="nt-gcard p-4 text-sm nt-shazam-body" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && claims.length === 0 && (
          <p className="nt-gcard p-4 text-sm nt-shazam-body">
            No major claims yet. Tap the orb above to verify a headline.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {claims.slice(0, 4).map((claim) => (
            <Link
              key={claim.id}
              to={`${ROUTES.confusionMap}?claim=${claim.id}`}
              className="nt-gcard nt-press block p-4"
              onClick={() => haptic("light")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="nt-shazam-badge">{outcomeLabel(claim)}</span>
                <span className="text-[11px] nt-shazam-muted">{formatRelativeTime(claim.extractedAt)}</span>
              </div>
              <p className="mt-2 text-[15px] font-bold leading-snug nt-shazam-ink">{claim.text}</p>
              <p className="mt-1 text-[11px] nt-shazam-muted">
                {[claim.category, claim.location?.label].filter(Boolean).join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <WhatsHappening glass />

      <Link to={ROUTES.disclosure} className="text-center text-[12px] font-semibold nt-shazam-muted underline">
        How NomaeTrust uses AI responsibly
      </Link>
    </>
  );

  if (!isMobile) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 lg:px-8">
          <div className="nt-shazam overflow-hidden rounded-[32px]">{hero}</div>
        </div>
      </div>
    );
  }

  return <div className="nt-shazam">{hero}</div>;
}
