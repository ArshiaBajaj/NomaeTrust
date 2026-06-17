import { useCallback, useEffect, useState } from "react";
import FearMap from "../components/FearMap";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import {
  getCommunityClaims,
  getMapHotspots,
  getValidatorQueue,
  reportClaim,
  validateClaimApi,
} from "../services/map";
import type { Claim, MapHotspot } from "../types";

type Tab = "map" | "feed" | "validators";

export default function TrustMap() {
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [validatorQueue, setValidatorQueue] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const [tab, setTab] = useState<Tab>("map");
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [validatorId, setValidatorId] = useState("validator-ngo-01");
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [hotspotData, claimData, queueData] = await Promise.all([
      getMapHotspots(),
      getCommunityClaims(),
      getValidatorQueue(),
    ]);
    setHotspots(hotspotData);
    setClaims(claimData);
    setValidatorQueue(queueData);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

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

  const handleValidate = async (claimId: string) => {
    setValidatingId(claimId);
    try {
      await validateClaimApi(claimId, validatorId, "NGO Provenance Badge");
      await refresh();
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
        description="Anonymized confusion heatmap, claims feed, and human validator fast lane for urgent items."
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["map", "Geo map"],
              ["feed", "Claims feed"],
              ["validators", "Validator queue"],
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
            <h2 className="card-title text-xl">Confusion Map — Atlanta metro</h2>
            <p className="mt-1 text-sm text-text-muted">
              Pin size reflects unverified claim volume. Data is anonymized metadata only.
            </p>
            <div className="mt-4">
              <FearMap
                hotspots={hotspots}
                selectedId={selectedHotspot}
                onSelect={setSelectedHotspot}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedHotspot(h.id)}
                  className={`card p-4 text-left text-sm ${
                    selectedHotspot === h.id ? "ring-2 ring-accent/40" : ""
                  }`}
                >
                  <p className="font-semibold text-navy">{h.label}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {h.unverifiedCount} unverified / {h.claimCount} total
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === "validators" && (
          <section className="mb-10">
            <h2 className="card-title text-xl">Human validator fast lane</h2>
            <p className="mt-2 text-sm text-text-muted">
              Urgent or low-confidence claims awaiting NGO review. Attach a provenance badge
              after independent verification.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <label className="text-xs text-text-muted">Validator ID</label>
              <input
                type="text"
                value={validatorId}
                onChange={(e) => setValidatorId(e.target.value)}
                className="input-field max-w-xs text-sm"
              />
            </div>
            <ul className="mt-6 space-y-3">
              {validatorQueue.length === 0 ? (
                <li className="card p-6 text-sm text-text-muted">
                  No items in queue — all caught up.
                </li>
              ) : (
                validatorQueue.map((claim) => (
                  <li key={claim.id} className="card p-4">
                    <p className="text-sm">{claim.text}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span>{claim.source}</span>
                      <span>{Math.round(claim.confidence * 100)}% confidence</span>
                      {claim.location && <span>{claim.location.label}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleValidate(claim.id)}
                      disabled={validatingId === claim.id}
                      className="btn-primary mt-4 text-sm"
                    >
                      {validatingId === claim.id
                        ? "Attaching badge…"
                        : "Attach provenance badge"}
                    </button>
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
                    {claim.urgentReview && (
                      <span className="text-secondary">Urgent review</span>
                    )}
                    {claim.provenanceBadge && (
                      <span className="text-success">✓ {claim.provenanceBadge}</span>
                    )}
                    {claim.location && (
                      <span className="text-text-muted">{claim.location.label}</span>
                    )}
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
