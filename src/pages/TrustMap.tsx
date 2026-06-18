import { useCallback, useEffect, useMemo, useState } from "react";
import ConfusionMap, { MapLegend } from "../components/ConfusionMap";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import {
  getCommunityClaims,
  getValidatorQueue,
  reportClaim,
  validateClaimApi,
} from "../services/map";
import type { Claim, ClaimSource } from "../types";
import { isAwaitingValidation, QUEUE_STATUS_LABEL } from "../utils/claimQueue";

type Tab = "map" | "feed" | "validators";
type MapFilter = "all" | "urgent" | "verified" | "unverified" | ClaimSource;

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TrustMap() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [validatorQueue, setValidatorQueue] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const [mapFilter, setMapFilter] = useState<MapFilter>("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("map");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [showHeat, setShowHeat] = useState(true);
  const [validatorId, setValidatorId] = useState("validator-ngo-01");
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [claimData, queueData] = await Promise.all([
      getCommunityClaims(),
      getValidatorQueue(),
    ]);
    setClaims(claimData);
    setValidatorQueue(queueData);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

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
      if (mapFilter === "unverified")
        return claim.status !== "verified";
      return claim.source === mapFilter;
    });
  }, [claims, mapFilter]);

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

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReporting(true);
    try {
      await reportClaim(reportText.trim());
      setReportText("");
      await refresh();
    } finally {
      setReporting(false);
    }
  };

  const handleValidate = async (claim: Claim) => {
    setValidatingId(claim.id);
    setVerifySuccess(null);
    try {
      await validateClaimApi(claim.id, validatorId, "NGO Provenance Badge");
      await refresh();
      setVerifySuccess(claim.id);
      setSelectedClaimId(claim.id);
      setTimeout(() => setVerifySuccess(null), 4000);
    } finally {
      setValidatingId(null);
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
        description="Live intelligence view — every rumor pinned, clustered, and traceable. Anonymized neighborhood-level locations only."
      />

      <div className="mx-auto max-w-[1400px] px-6 pb-20 pt-10 lg:px-8">
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
                tab === id
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:text-navy"
              }`}
            >
              {label}
              {id === "validators" && validatorQueue.length > 0 && (
                <span className="ml-2 rounded-full bg-secondary/15 px-2 py-0.5 text-xs text-secondary">
                  {validatorQueue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "map" && (
          <section className="mb-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="card-title text-xl">Every rumor — Atlanta metro</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {mapClaims.length} pins on map · click a pin or list item for details
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="checkbox"
                  checked={showHeat}
                  onChange={(e) => setShowHeat(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Confusion heat halos
              </label>
            </div>

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
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMapFilter(id)}
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

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div>
                <ConfusionMap
                  claims={mapClaims}
                  selectedId={selectedClaimId}
                  onSelect={setSelectedClaimId}
                  showHeat={showHeat}
                />
                <div className="mt-4">
                  <MapLegend />
                </div>
              </div>

              <aside className="card flex max-h-[min(520px,65vh)] flex-col overflow-hidden">
                <div className="border-b border-[rgba(0,0,0,0.06)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    Rumor index
                  </p>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search rumors…"
                    className="input-field mt-3 w-full text-sm"
                  />
                </div>
                <ul className="flex-1 overflow-y-auto p-2">
                  {sidebarClaims.length === 0 ? (
                    <li className="p-4 text-sm text-text-muted">No rumors match filters.</li>
                  ) : (
                    sidebarClaims.map((claim) => (
                      <li key={claim.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedClaimId(claim.id)}
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
                            {claim.location && <span>{claim.location.label}</span>}
                            {isAwaitingValidation(claim) && (
                              <span className="font-semibold text-accent">
                                {QUEUE_STATUS_LABEL[claim.status as keyof typeof QUEUE_STATUS_LABEL] ?? "In queue"}
                              </span>
                            )}
                          </div>
                          {isAwaitingValidation(claim) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTab("validators");
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
              </aside>
            </div>
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
                Rumor verified — it now appears as a{" "}
                <strong>green pin</strong> on the map and leaves the queue.
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
              <p className="mt-2 text-xs text-text-muted">
                This ID is attached to the provenance badge when you verify a rumor.
              </p>
            </div>

            <ul className="mt-6 space-y-4">
              {validatorQueue.length === 0 ? (
                <li className="card p-8 text-center">
                  <p className="font-medium text-navy">Queue is empty</p>
                  <p className="mt-2 text-sm text-text-muted">
                    All rumors are verified. New unverified claims from Action Cards
                    and community reports will appear here automatically.
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
                      <span className="text-xs font-bold text-text-muted">
                        Queue #{index + 1}
                      </span>
                      <div className="flex flex-wrap gap-2">
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
                      <p className="text-base font-medium leading-snug text-navy">
                        {claim.text}
                      </p>
                      <div className="mt-4 grid gap-2 text-xs text-text-muted sm:grid-cols-2">
                        <span>
                          <strong className="text-text-body">Source:</strong>{" "}
                          {claim.source}
                        </span>
                        <span>
                          <strong className="text-text-body">Confidence:</strong>{" "}
                          {Math.round(claim.confidence * 100)}%
                        </span>
                        {claim.category && (
                          <span>
                            <strong className="text-text-body">Category:</strong>{" "}
                            {claim.category}
                          </span>
                        )}
                        {claim.location && (
                          <span>
                            <strong className="text-text-body">Area:</strong>{" "}
                            {claim.location.label}
                          </span>
                        )}
                        <span>
                          <strong className="text-text-body">Reported:</strong>{" "}
                          {formatRelativeTime(claim.extractedAt)}
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleValidate(claim)}
                          disabled={validatingId === claim.id || !validatorId.trim()}
                          className="btn-primary text-sm"
                        >
                          {validatingId === claim.id
                            ? "Verifying…"
                            : "✓ Mark as verified"}
                        </button>
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

        {tab !== "validators" && (
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
                      filter === f
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted hover:text-navy"
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
                    <span className="text-text-muted">{claim.source}</span>
                    {claim.category && (
                      <span className="text-text-muted">{claim.category}</span>
                    )}
                    {claim.urgentReview && (
                      <span className="text-secondary">Urgent review</span>
                    )}
                    {claim.provenanceBadge && (
                      <span className="text-success">✓ {claim.provenanceBadge}</span>
                    )}
                    {isAwaitingValidation(claim) && (
                      <button
                        type="button"
                        onClick={() => setTab("validators")}
                        className="font-semibold text-accent hover:underline"
                      >
                        In queue — review
                      </button>
                    )}
                    {claim.location && (
                      <span className="text-text-muted">{claim.location.label}</span>
                    )}
                    <span className="text-text-muted">{formatRelativeTime(claim.extractedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
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
    { label: "Rumor detected", detail: "Voice, screenshot, or community report" },
    { label: "Validator queue", detail: `${queueCount} awaiting NGO review` },
    { label: "Verified", detail: `${verifiedCount} on map as green pins` },
  ];

  return (
    <div>
      <h2 className="card-title text-xl">Validator queue</h2>
      <p className="mt-2 text-sm text-text-muted">
        Every unverified rumor lands here. NGO validators check official sources, then
        mark it verified — the pin turns green on the map.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className="card relative p-4"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              {i + 1}
            </span>
            <p className="mt-3 text-sm font-semibold text-navy">{step.label}</p>
            <p className="mt-1 text-xs text-text-muted">{step.detail}</p>
            {i < steps.length - 1 && (
              <span
                className="absolute right-0 top-1/2 hidden translate-x-1/2 text-text-muted sm:block"
                aria-hidden
              >
                →
              </span>
            )}
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

  return (
    <span className={`badge border capitalize ${styles[status]}`}>{status}</span>
  );
}
