import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FactCheckHitCard from "../components/newsWatch/FactCheckHitCard";
import NewsShareSetup from "../components/newsWatch/NewsShareSetup";
import LoadingSpinner from "../components/LoadingSpinner";
import OutletReliabilityBadge from "../components/newsWatch/OutletReliabilityBadge";
import VerificationResult from "../components/VerificationResult";
import { useHaptic } from "../hooks/useHaptic";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  checkNewsStory,
  fetchNewsOutlets,
  fetchNewsWatchFeed,
} from "../services/newsWatchApi";
import type { EvidenceCard, FactCheckHit, NewsOutlet, NewsWatchCheckResult } from "../types";
import {
  extensionSourceLabel,
  isAutoVerifyShareEnabled,
  parseSharedNewsPayload,
  type ExtensionSource,
} from "../utils/shareTarget";

const DEMO_HEADLINE =
  "BREAKING: Atlanta Public Schools closing all campuses tomorrow — officials say stay home";

function buildEvidenceCard(result: NewsWatchCheckResult): EvidenceCard {
  const ec = result.evidenceCard;
  return {
    id: `NW-${Date.now().toString(36).toUpperCase()}`,
    claim: result.claim,
    status: "pending",
    statusLabel: "News Watch",
    confidence: ec.verificationOutcomeConfidence
      ? ec.verificationOutcomeConfidence / 100
      : 0.5,
    confidenceBand: ec.confidenceBand,
    verificationOutcome: ec.verificationOutcome,
    verificationConfidence: ec.verificationOutcomeConfidence,
    sources: ec.sourceReferences.map((s) => s.title),
    sourceReferences: ec.sourceReferences,
    summary: ec.summary,
    plainLanguageSummary: ec.plainLanguageSummary,
    valuesBridge: ec.valuesBridge,
    recommendation: ec.recommendation,
    actionSteps: ec.actionSteps,
    doNotDo: ec.doNotDo,
    primaryActionLabel: ec.primaryActionLabel,
    primaryActionUrl: ec.primaryActionUrl,
    translations: ec.translations,
    verifiedAt: new Date().toISOString(),
    riskLevel:
      ec.confidenceBand === "high"
        ? "low"
        : ec.confidenceBand === "medium"
          ? "medium"
          : "high",
    sourceType: "news",
    demoMode: result.demoMode,
    demoReason: result.demoMode
      ? "Using curated demo fact-checks — add GOOGLE_FACT_CHECK_API_KEY for live ClaimReview search."
      : undefined,
    urgentReview: ec.urgentReview,
  };
}

export default function NewsWatch() {
  const isMobile = useIsMobile();
  const haptic = useHaptic();
  const [searchParams, setSearchParams] = useSearchParams();
  const shareHandled = useRef(false);

  const [headline, setHeadline] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewsWatchCheckResult | null>(null);
  const [outlets, setOutlets] = useState<NewsOutlet[]>([]);
  const [feed, setFeed] = useState<FactCheckHit[]>([]);
  const [outletQuery, setOutletQuery] = useState("");
  const [feedDemo, setFeedDemo] = useState(false);
  const [fromShare, setFromShare] = useState(false);
  const [fromPlatform, setFromPlatform] = useState<ExtensionSource | null>(null);
  const [pasteHint, setPasteHint] = useState<string | null>(null);

  const runCheck = useCallback(
    async (input: { headline?: string; url?: string }) => {
      setLoading(true);
      setError(null);
      setResult(null);
      haptic("light");
      try {
        const data = await checkNewsStory(input);
        setResult(data);
        haptic("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Check failed.");
        haptic("error");
      } finally {
        setLoading(false);
      }
    },
    [haptic],
  );

  // Handle Web Share Target / deep links from Apple News, Safari, etc.
  useEffect(() => {
    if (shareHandled.current) return;

    const shared = parseSharedNewsPayload(searchParams.toString());
    if (!shared.fromShare) return;

    shareHandled.current = true;
    setFromShare(true);
    setFromPlatform(shared.fromPlatform);
    if (shared.headline) setHeadline(shared.headline);
    if (shared.url) setUrl(shared.url);

    setSearchParams({}, { replace: true });

    const shouldAutoVerify =
      shared.fromPlatform != null ||
      (isAutoVerifyShareEnabled() && (shared.headline || shared.url));

    if (shouldAutoVerify && (shared.headline || shared.url)) {
      void runCheck({
        headline: shared.headline || undefined,
        url: shared.url || undefined,
      });
    }
  }, [searchParams, setSearchParams, runCheck]);

  useEffect(() => {
    void fetchNewsOutlets().then(setOutlets).catch(() => {});
    void fetchNewsWatchFeed()
      .then((data) => {
        setFeed(data.factChecks);
        setFeedDemo(data.demoMode);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() && !url.trim()) return;
    void runCheck({
      headline: headline.trim() || undefined,
      url: url.trim() || undefined,
    });
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) {
        setPasteHint("Clipboard is empty.");
        return;
      }
      if (/^https?:\/\//i.test(trimmed)) {
        setUrl(trimmed);
        setPasteHint("Link pasted — tap Check story.");
      } else {
        setHeadline(trimmed);
        setPasteHint("Headline pasted — tap Check story.");
      }
      haptic("light");
    } catch {
      setPasteHint("Allow clipboard access, or paste manually.");
    }
  };

  const filteredOutlets = outlets.filter((o) => {
    const q = outletQuery.toLowerCase();
    if (!q) return true;
    return (
      o.name.toLowerCase().includes(q) ||
      o.tierLabel.toLowerCase().includes(q) ||
      o.domains.some((d) => d.includes(q))
    );
  });

  const card = result ? buildEvidenceCard(result) : null;

  return (
    <div className={isMobile ? "mobile-screen" : "page-shell"}>
      <div className={`mx-auto max-w-3xl ${isMobile ? "mobile-screen-pad" : "px-6 pb-20 pt-10 lg:px-8"}`}>
        <header className="mobile-screen-intro">
          <h2 className="mobile-screen-title">News Watch</h2>
          <p className="mobile-screen-subtitle">
            Share any story from Apple News, Google News, or Safari — NomaeTrust verifies outlet
            context, fact-checks, and builds an Action Card.
          </p>
        </header>

        {fromShare && loading && (
          <div className="nw-shared-banner mb-4">
            <span className="nw-shared-banner-icon" aria-hidden>↗</span>
            <p>
              {fromPlatform
                ? `Verifying from ${extensionSourceLabel(fromPlatform)}…`
                : "Verifying shared story…"}
            </p>
          </div>
        )}

        {!result && !loading && <NewsShareSetup compact={Boolean(fromShare && !result)} />}

        <form onSubmit={handleSubmit} className="mobile-card mb-6 mt-6 p-5">
          <label className="nw-label" htmlFor="nw-headline">
            Headline
          </label>
          <textarea
            id="nw-headline"
            className="nw-input"
            rows={3}
            placeholder="Paste a push alert or headline…"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            disabled={loading}
          />
          <label className="nw-label mt-4" htmlFor="nw-url">
            Source URL (optional)
          </label>
          <input
            id="nw-url"
            type="url"
            className="nw-input"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="ios-btn ios-btn-primary flex-1"
              disabled={loading || (!headline.trim() && !url.trim())}
            >
              Check story
            </button>
            <button
              type="button"
              className="ios-btn ios-btn-secondary"
              onClick={() => void handlePasteClipboard()}
              disabled={loading}
            >
              Paste
            </button>
            <button
              type="button"
              className="ios-btn ios-btn-secondary"
              disabled={loading}
              onClick={() => {
                setHeadline(DEMO_HEADLINE);
                setUrl("");
                void runCheck({ headline: DEMO_HEADLINE });
              }}
            >
              Demo
            </button>
          </div>
          {pasteHint && <p className="mt-2 text-xs text-text-muted">{pasteHint}</p>}
        </form>

        {loading && <LoadingSpinner label="Searching fact-checks and composing Action Card…" />}

        {error && (
          <div role="alert" className="mobile-card mb-6 border-secondary/30 bg-secondary/10 p-4 text-sm text-secondary">
            {error}
          </div>
        )}

        {result && card && !loading && (
          <section className="mb-8 space-y-4">
            {fromShare && (
              <div className="nw-shared-banner">
                <span className="nw-shared-banner-icon" aria-hidden>✓</span>
                <p>
                  {fromPlatform
                    ? `Verified from ${extensionSourceLabel(fromPlatform)}`
                    : "Verified from your news app share"}
                </p>
              </div>
            )}

            {result.outlet ? (
              <div>
                <h3 className="mobile-section-label">Outlet context</h3>
                <OutletReliabilityBadge outlet={result.outlet} compact />
              </div>
            ) : (
              <div className="mobile-card p-4 text-sm text-text-muted">
                Publisher not in our curated registry — verify the original source before sharing.
              </div>
            )}

            {result.factChecks.length > 0 && (
              <div>
                <h3 className="mobile-section-label">
                  Existing fact-checks ({result.factChecks.length})
                </h3>
                <div className="space-y-3">
                  {result.factChecks.map((hit) => (
                    <FactCheckHitCard key={hit.id} hit={hit} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mobile-section-label">Your Action Card</h3>
              <VerificationResult
                card={card}
                transcript={result.headline}
                transcriptTitle="Headline checked"
                extractionNote="NomaeTrust cites third-party fact-checkers — we do not auto-label outlets as fake news."
                variant={isMobile ? "dark" : "light"}
                syncedToMap
              />
            </div>

            <button
              type="button"
              className="ios-text-btn"
              onClick={() => {
                setResult(null);
                setHeadline("");
                setUrl("");
                setFromShare(false);
                setFromPlatform(null);
              }}
            >
              Check another story
            </button>
          </section>
        )}

        {!result && !loading && (
          <>
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="mobile-section-label mb-0">Trending fact-checks</h3>
                {feedDemo && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-400">
                    Demo data
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {feed.map((hit) => (
                  <FactCheckHitCard
                    key={hit.id}
                    hit={hit}
                    onSelect={() => {
                      setHeadline(hit.claim);
                      void runCheck({ headline: hit.claim });
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="mobile-section-label">Outlet browser</h3>
              <input
                type="search"
                className="nw-input mb-3"
                placeholder="Search outlets…"
                value={outletQuery}
                onChange={(e) => setOutletQuery(e.target.value)}
              />
              <div className="space-y-3">
                {filteredOutlets.map((outlet) => (
                  <OutletReliabilityBadge key={outlet.id} outlet={outlet} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
