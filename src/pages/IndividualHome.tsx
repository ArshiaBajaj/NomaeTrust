import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../config/navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import { useHaptic } from "../hooks/useHaptic";
import { useIsMobile } from "../hooks/useIsMobile";
import { usePortalAuth } from "../context/PortalAuthContext";
import { fetchMajorClaims } from "../services/majorClaimsApi";
import type { Claim } from "../types";

const SECONDARY_TOOLS = [
  { to: ROUTES.actionCards, label: "Voice notes", icon: "🎤" },
  { to: ROUTES.screenshots, label: "Screenshots", icon: "📸" },
  { to: ROUTES.detective, label: "Detective", icon: "🕵️" },
  { to: ROUTES.contextTrace, label: "Context Trace", icon: "🔍" },
] as const;

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

  useEffect(() => {
    void fetchMajorClaims()
      .then(setClaims)
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={isMobile ? "mobile-screen" : "page-shell"}>
      <div className={`mx-auto max-w-3xl ${isMobile ? "mobile-screen-pad" : "px-6 pb-20 pt-10 lg:px-8"}`}>
        <header className="mobile-screen-intro">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            Welcome{individual ? `, ${individual.displayName.split(" ")[0]}` : ""}
          </p>
          <h1 className="mobile-screen-title">Major claims near you</h1>
          <p className="mobile-screen-subtitle">
            {individual
              ? `Focused on ${individual.city} — high-impact rumors with outlet context, fact-checks, and Action Cards.`
              : "High-impact rumors and headlines — verified with outlet context, fact-checks, and Action Cards."}
          </p>
        </header>

        <Link
          to={ROUTES.newsWatch}
          className="mobile-promo-card mt-6 block"
          onClick={() => haptic("light")}
        >
          <p className="mobile-promo-eyebrow">Verify a headline</p>
          <p className="mobile-promo-text">
            Paste a viral claim or share from Apple News. NomaeTrust checks outlets and
            ClaimReview before you forward it.
          </p>
          <span className="ios-btn ios-btn-primary ios-btn-sm mt-3 inline-flex">Check a story</span>
        </Link>

        <Link
          to={ROUTES.detective}
          className="mobile-promo-card mt-4 block mobile-promo-card--detective"
          onClick={() => haptic("light")}
        >
          <p className="mobile-promo-eyebrow">Digital Detective</p>
          <p className="mobile-promo-text">
            Swipe through mystery clips — spot deepfakes, earn XP, and train your media
            forensics instincts before rumors spread.
          </p>
          <span className="ios-btn ios-btn-secondary ios-btn-sm mt-3 inline-flex">Play now</span>
        </Link>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="mobile-section-label mb-0">Major claims</h2>
            <Link to={ROUTES.confusionMap} className="text-xs font-semibold text-accent">
              View map →
            </Link>
          </div>

          {loading && <LoadingSpinner label="Loading major claims…" />}
          {error && (
            <p className="text-sm text-secondary" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && claims.length === 0 && (
            <div className="mobile-card p-4 text-sm text-text-muted">
              No major claims yet. Check News Watch or verify a voice note to seed the map.
            </div>
          )}

          <div className="space-y-3">
            {claims.map((claim) => (
              <article key={claim.id} className="major-claim-card">
                <div className="major-claim-card-header">
                  <span
                    className={`major-claim-badge ${
                      claim.urgentReview ? "major-claim-badge--urgent" : ""
                    }`}
                  >
                    {outcomeLabel(claim)}
                  </span>
                  <span className="major-claim-time">{formatRelativeTime(claim.extractedAt)}</span>
                </div>
                <p className="major-claim-text">{claim.text}</p>
                <div className="major-claim-meta">
                  {claim.category && <span>{claim.category}</span>}
                  {claim.location?.label && <span>{claim.location.label}</span>}
                </div>
                <Link
                  to={`${ROUTES.confusionMap}?claim=${claim.id}`}
                  className="major-claim-link"
                  onClick={() => haptic("light")}
                >
                  Open on Confusion Map →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mobile-section-label">More tools</h2>
          <div className="mobile-action-grid mobile-action-grid--compact">
            {SECONDARY_TOOLS.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="mobile-action-card mobile-action-card--compact"
                onClick={() => haptic("light")}
              >
                <span aria-hidden>{tool.icon}</span>
                <span>{tool.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
