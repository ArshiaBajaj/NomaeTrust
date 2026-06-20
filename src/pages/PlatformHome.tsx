import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useHaptic } from "../hooks/useHaptic";
import { useIsMobile } from "../hooks/useIsMobile";
import { usePortalAuth } from "../context/PortalAuthContext";
import {
  fetchPlatformReviews,
  fetchPlatformStats,
  overridePlatformReview,
  submitPlatformContent,
  type PlatformReview,
  type PlatformStats,
  type PublishStatus,
} from "../services/platformApi";

const STATUS_LABEL: Record<PublishStatus, string> = {
  approved: "Approved",
  hold: "Hold",
  blocked: "Blocked",
};

function StatusPill({ status }: { status: PublishStatus }) {
  return (
    <span className={`platform-status platform-status--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function PlatformHome() {
  const isMobile = useIsMobile();
  const haptic = useHaptic();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const highlightReviewId = searchParams.get("review");
  const { platform } = usePortalAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [platformName, setPlatformName] = useState(platform?.orgName ?? "Reddit Mod Team");
  const [contentType, setContentType] = useState<PlatformReview["contentType"]>("post");
  const [draftText, setDraftText] = useState(
    "BREAKING: Atlanta Public Schools closing all campuses tomorrow — officials say stay home",
  );

  const refresh = useCallback(async () => {
    const [s, r] = await Promise.all([fetchPlatformStats(), fetchPlatformReviews()]);
    setStats(s);
    setReviews(r);
  }, []);

  useEffect(() => {
    void refresh()
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed."))
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!highlightReviewId) return;
    const el = document.getElementById(`review-${highlightReviewId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightReviewId, reviews]);

  useEffect(() => {
    if (hash !== "#queue") return;
    document.getElementById("platform-queue")?.scrollIntoView({ behavior: "smooth" });
  }, [hash, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;
    setSubmitting(true);
    setError(null);
    haptic("light");
    try {
      await submitPlatformContent({
        platformId: platformName.toLowerCase().replace(/\s+/g, "-"),
        platformName,
        contentType,
        text: draftText.trim(),
      });
      await refresh();
      haptic("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
      haptic("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverride = async (id: string, status: PublishStatus) => {
    haptic("light");
    try {
      await overridePlatformReview(id, status, "Manual moderator override");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Override failed.");
    }
  };

  return (
    <div className={isMobile ? "nt-screen nt-stagger" : "page-shell"}>
      <div className={isMobile ? "" : "mx-auto max-w-4xl px-6 pb-20 pt-10 lg:px-8"}>
        <header className="rounded-[24px] p-5 text-white" style={{ background: "var(--grad-lilac)" }}>
          <p className="nt-kicker text-white/80">{platform?.orgName ?? "Platform portal"}</p>
          <h1 className="nt-h1 mt-1 text-white">Publish gate</h1>
          <p className="mt-2 text-[14px] text-white/85">
            {platform
              ? `${platform.teamName} · ${platform.role} — review content before it goes live.`
              : "Route content through NomaeTrust before it goes live."}
          </p>
        </header>

        {loading && <LoadingSpinner label="Loading platform dashboard…" />}

        {stats && (
          <div className="platform-stats-grid mt-6">
            <div className="platform-stat-card">
              <p className="platform-stat-value">{stats.last24h}</p>
              <p className="platform-stat-label">Reviews (24h)</p>
            </div>
            <div className="platform-stat-card platform-stat-card--approved">
              <p className="platform-stat-value">{stats.approved}</p>
              <p className="platform-stat-label">Approved</p>
            </div>
            <div className="platform-stat-card platform-stat-card--hold">
              <p className="platform-stat-value">{stats.hold}</p>
              <p className="platform-stat-label">On hold</p>
            </div>
            <div className="platform-stat-card platform-stat-card--blocked">
              <p className="platform-stat-value">{stats.blocked}</p>
              <p className="platform-stat-label">Blocked</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="nt-card mt-2 p-5">
          <h2 className="nt-kicker">Test pre-publish review</h2>
          <p className="mb-4 text-[12px] text-muted">
            Simulates a platform calling <code>POST /api/platform/submit</code> before posting.
          </p>
          <label className="nw-label" htmlFor="platform-name">
            Platform name
          </label>
          <input
            id="platform-name"
            className="nw-input"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            disabled={submitting}
          />
          <label className="nw-label mt-4" htmlFor="content-type">
            Content type
          </label>
          <select
            id="content-type"
            className="nw-input"
            value={contentType}
            onChange={(e) =>
              setContentType(e.target.value as PlatformReview["contentType"])
            }
            disabled={submitting}
          >
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="message">Message</option>
            <option value="article">Article</option>
          </select>
          <label className="nw-label mt-4" htmlFor="draft-text">
            Draft content
          </label>
          <textarea
            id="draft-text"
            className="nw-input"
            rows={4}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            className="nt-btn nt-btn-primary nt-press mt-4 w-full"
            disabled={submitting || !draftText.trim()}
          >
            {submitting ? "Reviewing…" : "Submit for review"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-secondary" role="alert">
            {error}
          </p>
        )}

        <section className="mt-8" id="platform-queue">
          <h2 className="nt-kicker px-1">Review queue</h2>
          {reviews.length === 0 && !loading && (
            <div className="nt-card p-4 text-sm text-muted">
              No reviews yet. Submit draft content above or connect your Discord bot / extension.
            </div>
          )}
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                id={`review-${review.id}`}
                className={`platform-review-card ${
                  highlightReviewId === review.id ? "platform-review-card--highlight" : ""
                }`}
              >
                <div className="platform-review-card-header">
                  <div>
                    <p className="platform-review-platform">
                      {review.platformName} · {review.contentType}
                    </p>
                    <p className="platform-review-time">
                      {new Date(review.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusPill status={review.publishStatus} />
                </div>
                <p className="platform-review-text">{review.text}</p>
                <p className="platform-review-reason">{review.reason}</p>
                {review.factChecks[0] && (
                  <p className="platform-review-fc text-xs text-text-muted">
                    Fact-check: {review.factChecks[0].publisher} — {review.factChecks[0].rating}
                  </p>
                )}
                <div className="platform-review-actions">
                  <a
                    href={review.cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-accent"
                  >
                    Action Card →
                  </a>
                  {review.publishStatus !== "approved" && (
                    <button
                      type="button"
                      className="ios-text-btn text-xs"
                      onClick={() => void handleOverride(review.id, "approved")}
                    >
                      Approve
                    </button>
                  )}
                  {review.publishStatus !== "blocked" && (
                    <button
                      type="button"
                      className="ios-text-btn text-xs"
                      onClick={() => void handleOverride(review.id, "blocked")}
                    >
                      Block
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nt-card p-5">
          <h2 className="nt-kicker">Integration</h2>
          <p className="text-sm text-body">
            Platforms call <code>POST /api/platform/submit</code> with{" "}
            <code>X-NomaeTrust-Key</code> before content goes live. Discord bot and browser
            extension use the same verification pipeline via{" "}
            <code>POST /api/extension/verify</code>.
          </p>
          <Link to="/disclosure" className="mt-3 inline-block text-sm font-semibold text-accent">
            Read methodology →
          </Link>
        </section>
      </div>
    </div>
  );
}
