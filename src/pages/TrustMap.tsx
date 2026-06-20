import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import ConfusionMap, { ClaimMapDetail, MapLegend } from "../components/ConfusionMap";
import { useHaptic } from "../hooks/useHaptic";
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
import type {
  CategoryStat,
  Claim,
  ClaimSource,
  MapHotspot,
  OfficialFeedPin,
} from "../types";
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

const MAP_FILTERS: ReadonlyArray<readonly [MapFilter, string]> = [
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
];

const STATUS_TONE: Record<Claim["status"], string> = {
  verified: "bg-mint-soft text-[#2f8f68]",
  unverified: "bg-pink-soft text-pink-deep",
  disputed: "bg-yellow-soft text-yellow-deep",
  pending: "bg-blue-soft text-blue-deep",
};

const STATUS_DOT: Record<Claim["status"], string> = {
  verified: "bg-success",
  unverified: "bg-danger",
  disputed: "bg-yellow-deep",
  pending: "bg-blue",
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
  const haptic = useHaptic();
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
      haptic("error");
    } else {
      setActionSuccess(message);
      setActionError(null);
      haptic("success");
    }
    window.setTimeout(() => {
      setActionError(null);
      setActionSuccess(null);
    }, 5000);
  };

  const handleReport = async (e: FormEvent) => {
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
    haptic("medium");
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
          : {
              escalated: true,
              urgentReview: true,
              validatorId,
              validatorNotes: validatorNotes || undefined,
            };

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
    haptic("light");
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
      <div className="nt-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 pt-24">
          <span className="nt-spinner" aria-hidden />
          <p className="text-[13px] font-semibold text-muted">Loading the Confusion Map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-screen">
      {/* Hero */}
      <header className="flex flex-col gap-2">
        <span className="nt-kicker nt-kicker--news">Live rumor intelligence</span>
        <h1 className="nt-h1">
          Community <span className="nt-gradient-text">Confusion Map</span>
        </h1>
        <p className="text-[13px] leading-relaxed text-body">
          AI analysis is separate from community verification. Every pin links to an Action Card.
        </p>
      </header>

      {/* Toasts */}
      {(fetchError || actionError || actionSuccess) && (
        <div className="flex flex-col gap-2">
          {fetchError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-pink-soft px-4 py-3 text-[13px] font-semibold text-pink-deep"
            >
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={() => void refresh()}
                className="nt-press rounded-pill bg-white/70 px-3 py-1 text-[12px] font-bold text-pink-deep"
              >
                Retry
              </button>
            </div>
          )}
          {actionError && (
            <div
              role="alert"
              className="rounded-2xl bg-pink-soft px-4 py-3 text-[13px] font-semibold text-pink-deep"
            >
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="rounded-2xl bg-mint-soft px-4 py-3 text-[13px] font-semibold text-[#2f8f68]">
              {actionSuccess}
            </div>
          )}
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total rumors" value={stats.total} tone="blue" />
        <StatCard label="Unverified" value={stats.unverified} tone="pink" />
        <StatCard label="In queue" value={validatorQueue.length} tone="lilac" />
        <StatCard label="Last 24h" value={stats.last24h} tone="butter" />
      </div>

      {/* Segmented tabs */}
      <div className="nt-segmented">
        {(
          [
            ["map", "Map"],
            ["feed", "Feed"],
            ["validators", `Queue${validatorQueue.length ? ` (${validatorQueue.length})` : ""}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              haptic("light");
              setTab(id);
            }}
            className={`nt-segment ${tab === id ? "nt-segment--active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "map" && (
        <MapView
          mapClaims={mapClaims}
          hotspots={hotspots}
          officialFeeds={officialFeeds}
          categoryStats={categoryStats}
          maxCategoryCount={maxCategoryCount}
          categoryFilter={categoryFilter}
          onToggleCategory={(c) =>
            setCategoryFilter((prev) => (prev === c ? null : c))
          }
          topHotspots={topHotspots}
          onHotspotClick={(h) => void handleHotspotClick(h)}
          nearbyClaims={geoStatus === "ready" ? nearbyClaims : []}
          timelineFilter={timelineFilter}
          onTimeline={setTimelineFilter}
          mapFilter={mapFilter}
          onMapFilter={(f) => {
            setMapFilter(f);
            setSelectedClaimId(null);
          }}
          showHeat={showHeat}
          onToggleHeat={() => setShowHeat((v) => !v)}
          showOfficialFeeds={showOfficialFeeds}
          onToggleOfficial={() => setShowOfficialFeeds((v) => !v)}
          selectedClaimId={selectedClaimId}
          onSelect={setSelectedClaimId}
          selectedClaim={selectedClaim}
          sidebarClaims={sidebarClaims}
          search={search}
          onSearch={setSearch}
          onOpenValidators={() => setTab("validators")}
          lastRefreshed={lastRefreshed}
          onRefresh={() => void refresh()}
          reportText={reportText}
          onReportText={setReportText}
          reporting={reporting}
          onReport={handleReport}
        />
      )}

      {tab === "feed" && (
        <FeedView
          claims={filteredClaims}
          filter={filter}
          onFilter={setFilter}
          reportText={reportText}
          onReportText={setReportText}
          reporting={reporting}
          onReport={handleReport}
        />
      )}

      {tab === "validators" && (
        <ValidatorsView
          queue={validatorQueue}
          verifiedCount={stats.verified}
          verifySuccess={verifySuccess}
          validatorId={validatorId}
          onValidatorId={setValidatorId}
          validatorNotes={validatorNotes}
          onValidatorNotes={setValidatorNotes}
          validatingId={validatingId}
          onAction={handleValidatorAction}
          onViewOnMap={(id) => {
            setSelectedClaimId(id);
            setTab("map");
          }}
        />
      )}

      {/* Hotspot drill-down sheet */}
      {hotspotDetail && (
        <div className="nt-overlay">
          <button
            type="button"
            aria-label="Close"
            className="nt-overlay-backdrop"
            onClick={() => setHotspotDetail(null)}
          />
          <div className="nt-sheet nt-card max-h-[72vh] overflow-y-auto p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="nt-kicker">Neighborhood drill-down</span>
                <h3 className="mt-1 text-[18px] font-extrabold text-ink">
                  {hotspotDetail.hotspot.label}
                </h3>
                <p className="mt-1 text-[12px] text-muted">
                  {hotspotDetail.hotspot.claimCount} rumors ·{" "}
                  {hotspotDetail.hotspot.unverifiedCount} unverified
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHotspotDetail(null)}
                className="nt-press text-[13px] font-bold text-muted"
              >
                Close
              </button>
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {hotspotDetail.claims.map((claim) => (
                <li key={claim.id} className="rounded-2xl bg-surface-2 p-3">
                  <p className="text-[13px] font-semibold text-ink">{claim.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted">
                    <span className="capitalize">{claim.status}</span>
                    {claim.category && <span>{claim.category}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClaimId(claim.id);
                      setHotspotDetail(null);
                    }}
                    className="nt-press mt-2 text-[12px] font-bold text-blue"
                  >
                    View on map →
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Map view
   --------------------------------------------------------------------------- */
function MapView({
  mapClaims,
  hotspots,
  officialFeeds,
  categoryStats,
  maxCategoryCount,
  categoryFilter,
  onToggleCategory,
  topHotspots,
  onHotspotClick,
  nearbyClaims,
  timelineFilter,
  onTimeline,
  mapFilter,
  onMapFilter,
  showHeat,
  onToggleHeat,
  showOfficialFeeds,
  onToggleOfficial,
  selectedClaimId,
  onSelect,
  selectedClaim,
  sidebarClaims,
  search,
  onSearch,
  onOpenValidators,
  lastRefreshed,
  onRefresh,
  reportText,
  onReportText,
  reporting,
  onReport,
}: {
  mapClaims: Claim[];
  hotspots: MapHotspot[];
  officialFeeds: OfficialFeedPin[];
  categoryStats: CategoryStat[];
  maxCategoryCount: number;
  categoryFilter: string | null;
  onToggleCategory: (category: string) => void;
  topHotspots: MapHotspot[];
  onHotspotClick: (hotspot: MapHotspot) => void;
  nearbyClaims: Claim[];
  timelineFilter: TimelineFilter;
  onTimeline: (t: TimelineFilter) => void;
  mapFilter: MapFilter;
  onMapFilter: (f: MapFilter) => void;
  showHeat: boolean;
  onToggleHeat: () => void;
  showOfficialFeeds: boolean;
  onToggleOfficial: () => void;
  selectedClaimId: string | null;
  onSelect: (id: string) => void;
  selectedClaim: Claim | null;
  sidebarClaims: Claim[];
  search: string;
  onSearch: (v: string) => void;
  onOpenValidators: () => void;
  lastRefreshed: Date | null;
  onRefresh: () => void;
  reportText: string;
  onReportText: (v: string) => void;
  reporting: boolean;
  onReport: (e: FormEvent) => void;
}) {
  return (
    <section className="relative flex flex-col gap-4">
      {/* meta + toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-muted">
          {mapClaims.length} pins
          {lastRefreshed && <> · updated {formatRelativeTime(lastRefreshed.toISOString())}</>}
        </p>
        <div className="flex items-center gap-2">
          <ToggleChip active={showHeat} onClick={onToggleHeat} label="Heat" />
          <ToggleChip active={showOfficialFeeds} onClick={onToggleOfficial} label="Official" />
          <button
            type="button"
            onClick={onRefresh}
            className="nt-chip nt-press"
            aria-label="Refresh map"
          >
            ↻
          </button>
        </div>
      </div>

      {/* timeline segmented */}
      <div className="nt-segmented">
        {(["24h", "7d", "all"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onTimeline(id)}
            className={`nt-segment ${timelineFilter === id ? "nt-segment--active" : ""}`}
          >
            {id === "all" ? "All time" : id}
          </button>
        ))}
      </div>

      {/* map filters */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {MAP_FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onMapFilter(id)}
            className={`nt-press shrink-0 rounded-pill px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
              mapFilter === id
                ? "bg-blue text-white shadow-[var(--shadow-lift)]"
                : "bg-surface-2 text-body"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* map */}
      <ConfusionMap
        claims={mapClaims}
        hotspots={hotspots}
        officialFeeds={officialFeeds}
        selectedId={selectedClaimId}
        onSelect={onSelect}
        onHotspotClick={onHotspotClick}
        showHeat={showHeat}
        showOfficialFeeds={showOfficialFeeds}
        fitBoundsKey={`${mapFilter}-${timelineFilter}-${categoryFilter ?? "all"}`}
        skipAutoFit={Boolean(selectedClaimId)}
      />

      <MapLegend showHotspots={showHeat} showOfficial={showOfficialFeeds} />

      {/* hot zones */}
      {topHotspots.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="nt-kicker">Hot zones</span>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {topHotspots.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => onHotspotClick(zone)}
                className="nt-press shrink-0 rounded-pill bg-yellow-soft px-3.5 py-1.5 text-[12px] font-bold text-yellow-deep"
              >
                {zone.label} · {zone.unverifiedCount} unverified
                {zone.topCategories.length > 0 && ` · ${zone.topCategories[0]}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* category waves */}
      {categoryStats.length > 0 && (
        <div className="nt-card flex flex-col gap-3 p-4">
          <span className="nt-kicker">Category waves</span>
          <ul className="flex flex-col gap-2.5">
            {categoryStats.slice(0, 6).map((row) => (
              <li key={row.category}>
                <button
                  type="button"
                  onClick={() => onToggleCategory(row.category)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span
                      className={
                        categoryFilter === row.category
                          ? "font-bold text-blue"
                          : "font-semibold text-body"
                      }
                    >
                      {row.category}
                    </span>
                    <span className="text-muted">{row.count}</span>
                  </div>
                  <div className="map-category-bar mt-1.5">
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

      {/* nearby */}
      {nearbyClaims.length > 0 && (
        <div className="nt-card flex flex-col gap-2.5 p-4">
          <span className="nt-kicker">Confusion near you</span>
          <ul className="flex flex-col gap-1">
            {nearbyClaims.map((claim) => (
              <li key={claim.id}>
                <button
                  type="button"
                  onClick={() => onSelect(claim.id)}
                  className="nt-press w-full rounded-2xl p-2.5 text-left hover:bg-surface-2"
                >
                  <p className="line-clamp-2 text-[13px] font-semibold text-ink">{claim.text}</p>
                  <p className="mt-1 text-[10px] font-semibold text-muted">
                    {claim.location?.label} · {formatRelativeTime(claim.extractedAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* rumor index */}
      <div className="nt-card flex flex-col gap-3 p-4">
        <span className="nt-kicker">Rumor index</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search rumors…"
          className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30"
        />
        <ul className="flex flex-col gap-1.5">
          {sidebarClaims.length === 0 ? (
            <li className="py-4 text-center text-[13px] text-muted">No rumors match filters.</li>
          ) : (
            sidebarClaims.map((claim) => (
              <li key={claim.id}>
                <button
                  type="button"
                  onClick={() => onSelect(claim.id)}
                  className={`nt-press w-full rounded-2xl p-3 text-left transition-colors ${
                    selectedClaimId === claim.id
                      ? "bg-blue-soft ring-1 ring-blue/30"
                      : "hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[claim.status]} ${
                        claim.urgentReview ? "claim-pin claim-pin--urgent" : ""
                      }`}
                    />
                    <span className="shrink-0 text-[10px] font-semibold text-muted">
                      {formatRelativeTime(claim.extractedAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold text-ink">
                    {claim.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted">
                    <span className="capitalize">{claim.source}</span>
                    {claim.category && <span>{claim.category}</span>}
                    {claim.analysisOutcome && (
                      <span className="text-lilac">AI: {claim.analysisOutcome.replace("_", " ")}</span>
                    )}
                    {isAwaitingValidation(claim) && (
                      <span className="text-blue">
                        {QUEUE_STATUS_LABEL[claim.status as keyof typeof QUEUE_STATUS_LABEL] ??
                          "In queue"}
                      </span>
                    )}
                  </div>
                  {isAwaitingValidation(claim) && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenValidators();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onOpenValidators();
                        }
                      }}
                      className="mt-2 inline-block text-[11px] font-bold text-blue"
                    >
                      Review in queue →
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* community reporting */}
      <ReportForm
        reportText={reportText}
        onReportText={onReportText}
        reporting={reporting}
        onReport={onReport}
      />

      {/* mobile bottom sheet for selected claim */}
      {selectedClaim && (
        <div className="map-bottom-sheet">
          <div className="map-bottom-sheet-handle" aria-hidden />
          <div className="flex items-center justify-between px-4 pt-2">
            <span className="nt-kicker">Selected rumor</span>
            <button
              type="button"
              onClick={() => onSelect("")}
              className="nt-press text-[12px] font-bold text-muted"
            >
              Close
            </button>
          </div>
          <ClaimMapDetail claim={selectedClaim} compact />
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Feed view
   --------------------------------------------------------------------------- */
function FeedView({
  claims,
  filter,
  onFilter,
  reportText,
  onReportText,
  reporting,
  onReport,
}: {
  claims: Claim[];
  filter: "all" | "verified" | "unverified";
  onFilter: (f: "all" | "verified" | "unverified") => void;
  reportText: string;
  onReportText: (v: string) => void;
  reporting: boolean;
  onReport: (e: FormEvent) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <ReportForm
        reportText={reportText}
        onReportText={onReportText}
        reporting={reporting}
        onReport={onReport}
      />

      <div className="nt-segmented">
        {(["all", "verified", "unverified"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilter(f)}
            className={`nt-segment capitalize ${filter === f ? "nt-segment--active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {claims.length === 0 ? (
          <li className="nt-card p-6 text-center text-[13px] text-muted">
            No rumors match this filter.
          </li>
        ) : (
          claims.map((claim) => (
            <li key={claim.id} className="nt-card flex flex-col gap-3 p-4">
              <p className="text-[14px] font-semibold leading-snug text-ink">{claim.text}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span
                  className={`rounded-pill px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${STATUS_TONE[claim.status]}`}
                >
                  {claim.status}
                </span>
                {claim.analysisOutcome && (
                  <span className="text-lilac">AI: {claim.analysisOutcome.replace("_", " ")}</span>
                )}
                <span className="text-muted capitalize">{claim.source}</span>
                {claim.category && <span className="text-muted">{claim.category}</span>}
                {claim.provenanceBadge && (
                  <span className="text-success">✓ {claim.provenanceBadge}</span>
                )}
              </div>
              <Link
                to={actionCardUrlForClaim(claim)}
                className="nt-press text-[12px] font-bold text-blue"
              >
                View Action Card →
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Validators view
   --------------------------------------------------------------------------- */
function ValidatorsView({
  queue,
  verifiedCount,
  verifySuccess,
  validatorId,
  onValidatorId,
  validatorNotes,
  onValidatorNotes,
  validatingId,
  onAction,
  onViewOnMap,
}: {
  queue: Claim[];
  verifiedCount: number;
  verifySuccess: string | null;
  validatorId: string;
  onValidatorId: (v: string) => void;
  validatorNotes: string;
  onValidatorNotes: (v: string) => void;
  validatingId: string | null;
  onAction: (claim: Claim, action: ValidatorAction) => void;
  onViewOnMap: (id: string) => void;
}) {
  const noId = !validatorId.trim();
  return (
    <section className="flex flex-col gap-4">
      <div className="nt-card flex flex-col gap-3 p-4">
        <span className="nt-kicker">Validator workflow</span>
        <p className="text-[12px] leading-relaxed text-body">
          AI analysis never turns a pin green. Validators verify, dispute, escalate, or attach
          evidence.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <WorkflowStep n={1} label="Detected" detail="Voice · screenshot · report" />
          <WorkflowStep n={2} label="Queue" detail={`${queue.length} awaiting`} />
          <WorkflowStep n={3} label="Verified" detail={`${verifiedCount} green pins`} />
        </div>
      </div>

      {verifySuccess && (
        <div className="rounded-2xl bg-mint-soft px-4 py-3 text-[13px] font-semibold text-[#2f8f68]">
          Rumor community-verified — green pin on map. AI analysis badge remains separate.
        </div>
      )}

      <div className="nt-card flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1.5">
          <span className="nt-kicker">Your validator ID</span>
          <input
            type="text"
            value={validatorId}
            onChange={(e) => onValidatorId(e.target.value)}
            placeholder="e.g. validator-ngo-01"
            className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="nt-kicker">Evidence / notes (optional)</span>
          <textarea
            value={validatorNotes}
            onChange={(e) => onValidatorNotes(e.target.value)}
            rows={3}
            placeholder="Link to official source, correction, or escalation reason…"
            className="w-full resize-none rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30"
          />
        </label>
      </div>

      {queue.length === 0 ? (
        <div className="nt-card flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-[15px] font-bold text-ink">Queue is empty</p>
          <p className="text-[12px] leading-relaxed text-muted">
            Pipeline claims arrive as pending (blue pins) until a validator verifies them.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {queue.map((claim, index) => (
            <li
              key={claim.id}
              className={`nt-card overflow-hidden ${
                verifySuccess === claim.id ? "ring-2 ring-success/50" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-2 px-4 py-2.5">
                <span className="text-[11px] font-extrabold text-muted">Queue #{index + 1}</span>
                <div className="flex flex-wrap gap-1.5">
                  {claim.escalated && (
                    <span className="rounded-pill bg-pink-soft px-2 py-0.5 text-[10px] font-extrabold uppercase text-pink-deep">
                      Escalated
                    </span>
                  )}
                  {claim.urgentReview && (
                    <span className="rounded-pill bg-pink-soft px-2 py-0.5 text-[10px] font-extrabold uppercase text-pink-deep">
                      Urgent
                    </span>
                  )}
                  <span
                    className={`rounded-pill px-2 py-0.5 text-[10px] font-extrabold uppercase ${STATUS_TONE[claim.status]}`}
                  >
                    {claim.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <p className="text-[14px] font-semibold leading-snug text-ink">{claim.text}</p>
                {claim.analysisOutcome && (
                  <p className="text-[11px] font-semibold text-lilac">
                    AI analysis: {claim.analysisOutcome.replace("_", " ")} — not community verified
                  </p>
                )}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted">
                  <span>
                    <strong className="font-bold text-body">Source:</strong> {claim.source}
                  </span>
                  <span>
                    <strong className="font-bold text-body">Conf:</strong>{" "}
                    {Math.round(claim.confidence * 100)}%
                  </span>
                  {claim.category && (
                    <span>
                      <strong className="font-bold text-body">Category:</strong> {claim.category}
                    </span>
                  )}
                  {claim.location && (
                    <span>
                      <strong className="font-bold text-body">Area:</strong> {claim.location.label}
                    </span>
                  )}
                </div>
                {claim.sourceReferences && claim.sourceReferences.length > 0 && (
                  <ul className="flex flex-col gap-1 text-[11px]">
                    {claim.sourceReferences.slice(0, 2).map((ref) => (
                      <li key={ref.url}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue hover:underline"
                        >
                          {ref.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onAction(claim, "verify")}
                    disabled={validatingId === claim.id || noId}
                    className="nt-btn nt-btn-primary !px-4 !py-2.5 !text-[13px] disabled:opacity-50"
                  >
                    {validatingId === claim.id ? "Saving…" : "✓ Verify"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(claim, "dispute")}
                    disabled={validatingId === claim.id || noId}
                    className="nt-btn nt-btn-ghost !px-4 !py-2.5 !text-[13px] disabled:opacity-50"
                  >
                    Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(claim, "escalate")}
                    disabled={validatingId === claim.id || noId}
                    className="nt-btn nt-btn-pink !px-4 !py-2.5 !text-[13px] disabled:opacity-50"
                  >
                    Escalate
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 text-[12px] font-bold">
                  <Link to={actionCardUrlForClaim(claim)} className="nt-press text-blue">
                    Action Card →
                  </Link>
                  <button
                    type="button"
                    onClick={() => onViewOnMap(claim.id)}
                    className="nt-press text-body"
                  >
                    View on map →
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Small shared pieces
   --------------------------------------------------------------------------- */
function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "pink" | "lilac" | "butter";
}) {
  const grad: Record<typeof tone, string> = {
    blue: "var(--grad-blue)",
    pink: "var(--grad-pink)",
    lilac: "var(--grad-lilac)",
    butter: "var(--grad-butter)",
  };
  const valueColor: Record<typeof tone, string> = {
    blue: "text-blue-deep",
    pink: "text-pink-deep",
    lilac: "text-lilac",
    butter: "text-yellow-deep",
  };
  return (
    <div className="nt-card flex items-center gap-3 p-3.5">
      <span
        className="h-9 w-1.5 rounded-pill"
        style={{ background: grad[tone] }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className={`text-[26px] font-extrabold leading-none ${valueColor[tone]}`}>{value}</p>
        <p className="mt-1 truncate text-[11px] font-semibold text-muted">{label}</p>
      </div>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`nt-press rounded-pill px-3 py-1.5 text-[12px] font-bold transition-colors ${
        active ? "bg-blue text-white" : "bg-surface-2 text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function WorkflowStep({ n, label, detail }: { n: number; label: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-soft text-[12px] font-extrabold text-blue-deep">
        {n}
      </span>
      <p className="mt-1 text-[12px] font-bold text-ink">{label}</p>
      <p className="text-[10px] leading-tight text-muted">{detail}</p>
    </div>
  );
}

function ReportForm({
  reportText,
  onReportText,
  reporting,
  onReport,
}: {
  reportText: string;
  onReportText: (v: string) => void;
  reporting: boolean;
  onReport: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onReport} className="nt-card flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1">
        <span className="nt-kicker">Community reporting</span>
        <p className="text-[12px] text-muted">Describe a claim or rumor — it drops a pin instantly.</p>
      </div>
      <input
        type="text"
        value={reportText}
        onChange={(e) => onReportText(e.target.value)}
        placeholder="e.g. ICE checkpoint on Buford Highway tonight"
        className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[14px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30"
      />
      <button
        type="submit"
        disabled={reporting || !reportText.trim()}
        className="nt-btn nt-btn-primary nt-btn-block disabled:opacity-50"
      >
        {reporting ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
