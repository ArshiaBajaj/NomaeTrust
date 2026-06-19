import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConfusionMap, { ClaimMapDetail, MapLegend } from "../components/ConfusionMap";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  actionCardUrlForClaim,
  disputeClaimApi,
  escalateClaimApi,
  getCategoryStats,
  getCommunityClaims,
  getHotspotClaims,
  getMapHotspots,
  getNearbyClaims,
  getOfficialFeeds,
  getValidatorQueue,
  reportClaim,
  subscribeMapStream,
  validateClaimApi,
} from "../services/map";
import type { CategoryStat, Claim, ClaimSource, MapHotspot, OfficialFeedPin } from "../types";
import { isAwaitingValidation, QUEUE_STATUS_LABEL } from "../utils/claimQueue";

type Tab = "map" | "feed" | "validators";
type MapFilter = "all" | "urgent" | "verified" | "unverified" | ClaimSource;
type TimelineFilter = "24h" | "7d" | "all";
type ValidatorAction = "verify" | "dispute" | "escalate";

const TIMELINE_HOURS: Record<TimelineFilter, number | undefined> = {
  "24h": 24,
  "7d": 168,
  all: undefined,
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function mergeClaimLists(existing: Claim[], incoming: Claim[]): Claim[] {
  const byId = new Map(existing.map((c) => [c.id, c]));
  for (const claim of incoming) byId.set(claim.id, claim);
  return [...byId.values()].sort(
    (a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime(),
  );
}

export default function TrustMap() {
  const isMobile = useIsMobile();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [officialFeeds, setOfficialFeeds] = useState<OfficialFeedPin[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [validatorQueue, setValidatorQueue] = useState<Claim[]>([]);
  const [nearbyClaims, setNearbyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [reportText, setReportText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const [mapFilter, setMapFilter] = useState<MapFilter>("all");
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("7d");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("map");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [showHeat, setShowHeat] = useState(true);
  const [showOfficialFeeds, setShowOfficialFeeds] = useState(true);
  const [validatorId, setValidatorId] = useState("validator-ngo-01");
  const [validatorNotes, setValidatorNotes] = useState("");
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [hotspotDetail, setHotspotDetail] = useState<{
    hotspot: MapHotspot;
    claims: Claim[];
  } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "denied" | "ready">("idle");

  const sinceHours = TIMELINE_HOURS[timelineFilter];

  const refresh = useCallback(async () => {
    try {
      const [claimData, queueData, hotspotData, feeds, categories] = await Promise.all([
        getCommunityClaims({ sinceHours, category: categoryFilter ?? undefined }),
        getValidatorQueue(),
        getMapHotspots(),
        getOfficialFeeds(),
        getCategoryStats(sinceHours ?? 168),
      ]);
      setClaims(claimData);
      setValidatorQueue(queueData);
      setHotspots(hotspotData);
      setOfficialFeeds(feeds);
      setCategoryStats(categories);
      setFetchError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Could not load map data.");
    }
  }, [sinceHours, categoryFilter]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const unsubscribe = subscribeMapStream(() => {
      void refresh();
    });
    return unsubscribe;
  }, [refresh]);

  useEffect(() => {
    if (geoStatus !== "idle") return;
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearby = await getNearbyClaims(pos.coords.latitude, pos.coords.longitude);
          setNearbyClaims(nearby);
          setGeoStatus("ready");
        } catch {
          setGeoStatus("denied");
        }
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [geoStatus]);

  const stats = useMemo(() => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    return {
      total: claims.length,
      unverified: claims.filter(
        (c) => c.status === "unverified" || c.status === "pending" || c.status === "disputed",
      ).length,
      urgent: claims.filter((c) => c.urgentReview).length,
      last24h: claims.filter((c) => new Date(c.extractedAt).getTime() > dayAgo).length,
      verified: claims.filter((c) => c.status === "verified").length,
    };
  }, [claims]);

  const mapClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (mapFilter === "all") return true;
      if (mapFilter === "urgent") return claim.urgentReview === true;
      if (mapFilter === "verified") return claim.status === "verified";
      if (mapFilter === "unverified") return claim.status !== "verified";
      return claim.source === mapFilter;
    });
  }, [claims, mapFilter]);

  const selectedClaim = useMemo(
    () => claims.find((c) => c.id === selectedClaimId) ?? null,
    [claims, selectedClaimId],
  );

  const topHotspots = useMemo(
    () => [...hotspots].sort((a, b) => b.unverifiedCount - a.unverifiedCount).slice(0, 3),
    [hotspots],
  );

  const maxCategoryCount = useMemo(
    () => Math.max(1, ...categoryStats.map((c) => c.count)),
    [categoryStats],
  );

  const sidebarClaims = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mapClaims.filter((claim) => {
      if (!q) return true;
      return (
        claim.text.toLowerCase().includes(q) ||
        claim.location?.label.toLowerCase().includes(q) ||
        claim.category?.toLowerCase().includes(q)
      );
    });
  }, [mapClaims, search]);

  const showToast = (message: string, isError = false) => {
    if (isError) {
      setActionError(message);
      setActionSuccess(null);
    } else {
      setActionSuccess(message);
      setActionError(null);
    }
    window.setTimeout(() => {
      setActionError(null);
      setActionSuccess(null);
    }, 5000);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReporting(true);
    setActionError(null);
    const optimistic: Claim = {
      id: `temp-${Date.now()}`,
      text: reportText.trim(),
      source: "community",
      status: "pending",
      confidence: 0.5,
      extractedAt: new Date().toISOString(),
      urgentReview: true,
      analysisOutcome: "inconclusive",
    };
    setClaims((prev) => [optimistic, ...prev]);
    setSelectedClaimId(optimistic.id);
    try {
      const created = await reportClaim(reportText.trim());
      setReportText("");
      setClaims((prev) =>
        mergeClaimLists(
          prev.filter((c) => c.id !== optimistic.id),
          [created],
        ),
      );
      setSelectedClaimId(created.id);
      showToast("Rumor reported — pin added to map.");
      void refresh();
    } catch (err) {
      setClaims((prev) => prev.filter((c) => c.id !== optimistic.id));
      showToast(err instanceof Error ? err.message : "Report failed", true);
    } finally {
      setReporting(false);
    }
  };

  const handleValidatorAction = async (claim: Claim, action: ValidatorAction) => {
    if (!validatorId.trim()) {
      showToast("Enter a validator ID first.", true);
      return;
    }
    setValidatingId(claim.id);
    setVerifySuccess(null);
    setActionError(null);

    const optimisticPatch: Partial<Claim> =
      action === "verify"
        ? {
            status: "verified",
            provenanceBadge: "NGO Provenance Badge",
            validatorId,
            validatedAt: new Date().toISOString(),
            urgentReview: false,
            escalated: false,
          }
        : action === "dispute"
          ? { status: "disputed", validatorId, validatorNotes: validatorNotes || undefined }
          : { escalated: true, urgentReview: true, validatorId, validatorNotes: validatorNotes || undefined };

    setClaims((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, ...optimisticPatch } : c)),
    );

    try {
      let updated: Claim;
      if (action === "verify") {
        updated = await validateClaimApi(
          claim.id,
          validatorId,
          "NGO Provenance Badge",
          validatorNotes || undefined,
        );
        setVerifySuccess(claim.id);
        setSelectedClaimId(claim.id);
      } else if (action === "dispute") {
        updated = await disputeClaimApi(claim.id, validatorId, validatorNotes || undefined);
      } else {
        updated = await escalateClaimApi(claim.id, validatorId, validatorNotes || undefined);
      }
      setClaims((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(
        action === "verify"
          ? "Community verified — green pin on map."
          : action === "dispute"
            ? "Marked as disputed."
            : "Escalated for urgent review.",
      );
      void refresh();
    } catch (err) {
      setClaims((prev) => prev.map((c) => (c.id === claim.id ? claim : c)));
      showToast(err instanceof Error ? err.message : "Validator action failed", true);
    } finally {
      setValidatingId(null);
    }
  };

  const handleHotspotClick = async (hotspot: MapHotspot) => {
    try {
      const hotspotClaims = await getHotspotClaims(hotspot.geohash);
      setHotspotDetail({ hotspot, claims: hotspotClaims });
    } catch {
      showToast("Could not load neighborhood detail.", true);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filter === "all") return true;
    if (filter === "verified") return c.status === "verified";
    return c.status === "unverified" || c.status === "disputed" || c.status === "pending";
  });

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader title="Community Confusion Map" description="Loading…" />
        <div className="flex justify-center px-6 py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Community Confusion Map"
        description="Live rumor intelligence — AI analysis is separate from community verification. Every pin links to an Action Card."
      />

      <div className="mx-auto max-w-[1400px] px-6 pb-20 pt-10 lg:px-8">
        {(fetchError || actionError || actionSuccess) && (
          <div className="mb-6 space-y-2">
            {fetchError && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
              >
                <span>{fetchError} — is the backend running on port 3001?</span>
                <button type="button" onClick={() => void refresh()} className="btn-secondary text-xs">
                  Retry
                </button>
              </div>
            )}
            {actionError && (
              <div role="alert" className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                {actionSuccess}
              </div>
            )}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total rumors", value: stats.total, accent: "text-navy" },
            { label: "Unverified", value: stats.unverified, accent: "text-secondary" },
            { label: "In validator queue", value: validatorQueue.length, accent: "text-accent" },
            { label: "Last 24 hours", value: stats.last24h, accent: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {s.label}
              </p>
              <p className={`mt-1 font-serif text-3xl font-medium ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["map", "Live map"],
              ["feed", "Claims feed"],
              ["validators", `Validator queue (${validatorQueue.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === id ? "bg-accent/10 text-accent" : "text-text-muted hover:text-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "map" && (
          <section className="mb-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="card-title text-xl">Every rumor — Atlanta metro</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {mapClaims.length} community pins · blue dots are official feeds
                  {lastRefreshed && (
                    <span className="ml-2 text-text-muted/80">
                      · updated {formatRelativeTime(lastRefreshed.toISOString())}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => void refresh()} className="btn-secondary text-xs">
                  Refresh map
                </button>
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input
                    type="checkbox"
                    checked={showHeat}
                    onChange={(e) => setShowHeat(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Confusion heat
                </label>
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input
                    type="checkbox"
                    checked={showOfficialFeeds}
                    onChange={(e) => setShowOfficialFeeds(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Official feeds
                </label>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Timeline
              </span>
              {(["24h", "7d", "all"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTimelineFilter(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    timelineFilter === id
                      ? "bg-navy text-white"
                      : "bg-surface-raised text-text-muted hover:text-navy"
                  }`}
                >
                  {id === "all" ? "All time" : id}
                </button>
              ))}
            </div>

            {categoryStats.length > 0 && (
              <div className="card mb-4 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                  Category waves
                </p>
                <ul className="mt-3 space-y-2">
                  {categoryStats.slice(0, 6).map((row) => (
                    <li key={row.category}>
                      <button
                        type="button"
                        onClick={() =>
                          setCategoryFilter((prev) =>
                            prev === row.category ? null : row.category,
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span
                            className={
                              categoryFilter === row.category
                                ? "font-bold text-accent"
                                : "text-text-body"
                            }
                          >
                            {row.category}
                          </span>
                          <span className="text-text-muted">{row.count}</span>
                        </div>
                        <div className="map-category-bar mt-1">
                          <div
                            className="map-category-bar-fill"
                            style={{ width: `${(row.count / maxCategoryCount) * 100}%` }}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(geoStatus === "ready" && nearbyClaims.length > 0) && (
              <div className="card mb-4 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                  Confusion near you
                </p>
                <ul className="mt-3 space-y-2">
                  {nearbyClaims.map((claim) => (
                    <li key={claim.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedClaimId(claim.id)}
                        className="w-full rounded-lg p-2 text-left hover:bg-surface-raised"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-navy">{claim.text}</p>
                        <p className="mt-1 text-[10px] text-text-muted">
                          {claim.location?.label} · {formatRelativeTime(claim.extractedAt)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topHotspots.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="self-center text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Hot zones
                </span>
                {topHotspots.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => void handleHotspotClick(zone)}
                    className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs text-amber-900 hover:bg-amber-500/20"
                  >
                    {zone.label} · {zone.unverifiedCount} unverified
                    {zone.topCategories.length > 0 && ` · ${zone.topCategories[0]}`}
                  </button>
                ))}
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["urgent", "Urgent"],
                  ["unverified", "Unverified"],
                  ["verified", "Verified"],
                  ["voice", "Voice"],
                  ["screenshot", "Screenshot"],
                  ["call", "Calls"],
                  ["community", "Community"],
                  ["deepfake", "Deepfakes"],
                  ["context-trace", "Context Trace"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMapFilter(id);
                    setSelectedClaimId(null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    mapFilter === id
                      ? "bg-navy text-white"
                      : "bg-surface-raised text-text-muted hover:text-navy"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className={`grid gap-6 ${isMobile ? "" : "lg:grid-cols-[1fr_340px]"}`}>
              <div className={isMobile ? "relative" : ""}>
                <ConfusionMap
                  claims={mapClaims}
                  hotspots={hotspots}
                  officialFeeds={officialFeeds}
                  selectedId={selectedClaimId}
                  onSelect={setSelectedClaimId}
                  onHotspotClick={(h) => void handleHotspotClick(h)}
                  showHeat={showHeat}
                  showOfficialFeeds={showOfficialFeeds}
                  fitBoundsKey={`${mapFilter}-${timelineFilter}-${categoryFilter ?? "all"}`}
                  skipAutoFit={Boolean(selectedClaimId)}
                />
                <div className="mt-4">
                  <MapLegend showHotspots={showHeat} showOfficial={showOfficialFeeds} />
                </div>
              </div>

              {!isMobile && (
                <aside className="card flex max-h-[min(520px,65vh)] flex-col overflow-hidden">
                  <SidebarClaimList
                    claims={sidebarClaims}
                    selectedClaimId={selectedClaimId}
                    onSelect={setSelectedClaimId}
                    search={search}
                    onSearchChange={setSearch}
                    selectedClaim={selectedClaim}
                    onOpenValidators={() => setTab("validators")}
                  />
                </aside>
              )}
            </div>

            {isMobile && selectedClaim && (
              <div className="map-bottom-sheet">
                <div className="map-bottom-sheet-handle" aria-hidden />
                <div className="flex items-center justify-between px-4 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    Selected rumor
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedClaimId(null)}
                    className="text-xs text-text-muted"
                  >
                    Close
                  </button>
                </div>
                <ClaimMapDetail claim={selectedClaim} compact />
              </div>
            )}

            {hotspotDetail && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
                <div className="card max-h-[80vh] w-full max-w-lg overflow-y-auto p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                        Neighborhood drill-down
                      </p>
                      <h3 className="card-title mt-1 text-lg">{hotspotDetail.hotspot.label}</h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {hotspotDetail.hotspot.claimCount} rumors ·{" "}
                        {hotspotDetail.hotspot.unverifiedCount} unverified
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHotspotDetail(null)}
                      className="text-sm text-text-muted"
                    >
                      Close
                    </button>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {hotspotDetail.claims.map((claim) => (
                      <li key={claim.id} className="rounded-lg border border-[rgba(0,0,0,0.06)] p-3">
                        <p className="text-sm font-medium text-navy">{claim.text}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-text-muted">
                          <span className="capitalize">{claim.status}</span>
                          {claim.category && <span>{claim.category}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClaimId(claim.id);
                            setHotspotDetail(null);
                          }}
                          className="mt-2 text-xs font-semibold text-accent"
                        >
                          View on map →
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <section className="card mt-8 p-6">
              <h2 className="card-title text-xl">Community reporting</h2>
              <form onSubmit={handleReport} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the claim or rumor"
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={reporting || !reportText.trim()}
                  className="btn-primary px-6 py-3"
                >
                  {reporting ? "Submitting…" : "Submit report"}
                </button>
              </form>
            </section>
          </section>
        )}

        {tab === "validators" && (
          <section className="mb-10">
            <ValidatorWorkflow
              queueCount={validatorQueue.length}
              verifiedCount={stats.verified}
            />

            {verifySuccess && (
              <div className="mb-6 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                Rumor community-verified — green pin on map. AI analysis badge remains separate.
              </div>
            )}

            <div className="card mt-6 p-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Your validator ID
              </label>
              <input
                type="text"
                value={validatorId}
                onChange={(e) => setValidatorId(e.target.value)}
                className="input-field mt-2 max-w-md text-sm"
                placeholder="e.g. validator-ngo-01"
              />
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Evidence / notes (optional)
              </label>
              <textarea
                value={validatorNotes}
                onChange={(e) => setValidatorNotes(e.target.value)}
                rows={3}
                className="input-field mt-2 w-full max-w-xl text-sm"
                placeholder="Link to official source, correction, or escalation reason…"
              />
            </div>

            <ul className="mt-6 space-y-4">
              {validatorQueue.length === 0 ? (
                <li className="card p-8 text-center">
                  <p className="font-medium text-navy">Queue is empty</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Pipeline claims arrive as pending (blue pins) until a validator verifies them.
                  </p>
                </li>
              ) : (
                validatorQueue.map((claim, index) => (
                  <li
                    key={claim.id}
                    className={`card overflow-hidden ${
                      verifySuccess === claim.id ? "ring-2 ring-success/40" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.06)] bg-surface-raised px-4 py-2">
                      <span className="text-xs font-bold text-text-muted">Queue #{index + 1}</span>
                      <div className="flex flex-wrap gap-2">
                        {claim.escalated && (
                          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-secondary">
                            Escalated
                          </span>
                        )}
                        {claim.urgentReview && (
                          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-secondary">
                            Urgent
                          </span>
                        )}
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-accent">
                          {claim.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-base font-medium leading-snug text-navy">{claim.text}</p>
                      {claim.analysisOutcome && (
                        <p className="mt-2 text-xs text-indigo-600">
                          AI analysis: {claim.analysisOutcome.replace("_", " ")} — not community verified
                        </p>
                      )}
                      <div className="mt-4 grid gap-2 text-xs text-text-muted sm:grid-cols-2">
                        <span>
                          <strong className="text-text-body">Source:</strong> {claim.source}
                        </span>
                        <span>
                          <strong className="text-text-body">Confidence:</strong>{" "}
                          {Math.round(claim.confidence * 100)}%
                        </span>
                        {claim.category && (
                          <span>
                            <strong className="text-text-body">Category:</strong> {claim.category}
                          </span>
                        )}
                        {claim.location && (
                          <span>
                            <strong className="text-text-body">Area:</strong> {claim.location.label}
                          </span>
                        )}
                      </div>
                      {claim.sourceReferences && claim.sourceReferences.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs">
                          {claim.sourceReferences.slice(0, 2).map((ref) => (
                            <li key={ref.url}>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                              >
                                {ref.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleValidatorAction(claim, "verify")}
                          disabled={validatingId === claim.id || !validatorId.trim()}
                          className="btn-primary text-sm"
                        >
                          {validatingId === claim.id ? "Saving…" : "✓ Verify"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleValidatorAction(claim, "dispute")}
                          disabled={validatingId === claim.id || !validatorId.trim()}
                          className="btn-secondary text-sm"
                        >
                          Dispute
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleValidatorAction(claim, "escalate")}
                          disabled={validatingId === claim.id || !validatorId.trim()}
                          className="btn-secondary text-sm"
                        >
                          Escalate
                        </button>
                        <Link
                          to={actionCardUrlForClaim(claim.id)}
                          className="btn-secondary text-sm"
                        >
                          Action Card
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClaimId(claim.id);
                            setTab("map");
                          }}
                          className="btn-secondary text-sm"
                        >
                          View on map
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        )}

        {tab === "feed" && (
          <>
            <section className="card mb-10 p-6">
              <h2 className="card-title text-xl">Community reporting</h2>
              <form onSubmit={handleReport} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the claim or rumor"
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={reporting || !reportText.trim()}
                  className="btn-primary px-6 py-3"
                >
                  {reporting ? "Submitting…" : "Submit report"}
                </button>
              </form>
            </section>

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h2 className="card-title text-xl">Claims feed</h2>
                <div className="flex gap-1">
                  {(["all", "verified", "unverified"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                        filter === f ? "bg-accent/10 text-accent" : "text-text-muted hover:text-navy"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="space-y-3">
                {filteredClaims.map((claim) => (
                  <li key={claim.id} className="card p-4">
                    <p className="text-sm">{claim.text}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <StatusBadge status={claim.status} />
                      {claim.analysisOutcome && (
                        <span className="text-indigo-600">
                          AI: {claim.analysisOutcome.replace("_", " ")}
                        </span>
                      )}
                      <span className="text-text-muted">{claim.source}</span>
                      {claim.category && <span className="text-text-muted">{claim.category}</span>}
                      {claim.provenanceBadge && (
                        <span className="text-success">✓ {claim.provenanceBadge}</span>
                      )}
                      <Link to={actionCardUrlForClaim(claim.id)} className="text-accent hover:underline">
                        Action Card
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SidebarClaimList({
  claims,
  selectedClaimId,
  onSelect,
  search,
  onSearchChange,
  selectedClaim,
  onOpenValidators,
}: {
  claims: Claim[];
  selectedClaimId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedClaim: Claim | null;
  onOpenValidators: () => void;
}) {
  return (
    <>
      <div className="border-b border-[rgba(0,0,0,0.06)] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Rumor index</p>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search rumors…"
          className="input-field mt-3 w-full text-sm"
        />
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {claims.length === 0 ? (
          <li className="p-4 text-sm text-text-muted">No rumors match filters.</li>
        ) : (
          claims.map((claim) => (
            <li key={claim.id}>
              <button
                type="button"
                onClick={() => onSelect(claim.id)}
                className={`mb-1 w-full rounded-lg p-3 text-left text-sm transition-colors ${
                  selectedClaimId === claim.id
                    ? "bg-accent/10 ring-1 ring-accent/30"
                    : "hover:bg-surface-raised"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <StatusDot status={claim.status} urgent={claim.urgentReview} />
                  <span className="shrink-0 text-[10px] text-text-muted">
                    {formatRelativeTime(claim.extractedAt)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 font-medium text-navy">{claim.text}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-text-muted">
                  <span className="capitalize">{claim.source}</span>
                  {claim.category && <span>{claim.category}</span>}
                  {claim.analysisOutcome && (
                    <span className="text-indigo-600">AI: {claim.analysisOutcome.replace("_", " ")}</span>
                  )}
                  {isAwaitingValidation(claim) && (
                    <span className="font-semibold text-accent">
                      {QUEUE_STATUS_LABEL[claim.status as keyof typeof QUEUE_STATUS_LABEL] ??
                        "In queue"}
                    </span>
                  )}
                </div>
                {isAwaitingValidation(claim) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenValidators();
                    }}
                    className="mt-2 text-[10px] font-semibold text-accent hover:underline"
                  >
                    Review in queue →
                  </button>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
      {selectedClaim && <ClaimMapDetail claim={selectedClaim} />}
    </>
  );
}

function ValidatorWorkflow({
  queueCount,
  verifiedCount,
}: {
  queueCount: number;
  verifiedCount: number;
}) {
  const steps = [
    { label: "Rumor detected", detail: "Voice, screenshot, Context Trace, or community report" },
    { label: "Validator queue", detail: `${queueCount} awaiting human review` },
    { label: "Community verified", detail: `${verifiedCount} green pins (not AI-suggested)` },
  ];

  return (
    <div>
      <h2 className="card-title text-xl">Validator queue</h2>
      <p className="mt-2 text-sm text-text-muted">
        AI analysis never turns a pin green. Validators verify, dispute, escalate, or attach evidence.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.label} className="card relative p-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              {i + 1}
            </span>
            <p className="mt-3 text-sm font-semibold text-navy">{step.label}</p>
            <p className="mt-1 text-xs text-text-muted">{step.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StatusDot({
  status,
  urgent,
}: {
  status: Claim["status"];
  urgent?: boolean;
}) {
  const colors: Record<Claim["status"], string> = {
    verified: "bg-success",
    unverified: "bg-secondary",
    disputed: "bg-amber-500",
    pending: "bg-accent",
  };
  return (
    <span
      className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${colors[status]} ${
        urgent ? "animate-pulse ring-2 ring-secondary/30" : ""
      }`}
    />
  );
}

function StatusBadge({ status }: { status: Claim["status"] }) {
  const styles = {
    verified: "border-success/25 bg-success/10 text-success",
    unverified: "border-secondary/25 bg-secondary/10 text-secondary",
    disputed: "border-[rgba(0,0,0,0.1)] bg-surface-raised text-text-muted",
    pending: "border-[rgba(0,0,0,0.07)] bg-surface-raised text-text-muted",
  };

  return <span className={`badge border capitalize ${styles[status]}`}>{status}</span>;
}
