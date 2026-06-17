import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { getCommunityClaims, getMapHotspots, reportClaim } from "../services/map";
import type { Claim, MapHotspot } from "../types";

export default function TrustMap() {
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">(
    "all",
  );

  useEffect(() => {
    Promise.all([getMapHotspots(), getCommunityClaims()]).then(
      ([hotspotData, claimData]) => {
        setHotspots(hotspotData);
        setClaims(claimData);
        setLoading(false);
      },
    );
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReporting(true);
    try {
      const newClaim = await reportClaim(reportText.trim());
      setClaims((prev) => [newClaim, ...prev]);
      setReportText("");
    } finally {
      setReporting(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filter === "all") return true;
    if (filter === "verified") return c.status === "verified";
    return c.status === "unverified" || c.status === "disputed";
  });

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader
          title="Misinformation hotspots"
          description="Track verified and unverified claims across communities."
        />
        <div className="flex justify-center px-6 py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Misinformation hotspots"
        description="Track verified and unverified claims across communities. Respond faster to emerging misinformation."
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8">
      <section className="mb-10">
        <h2 className="card-title text-xl">Activity map</h2>
        <div className="card mt-4 p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="flex flex-col rounded-xl border border-[rgba(0,0,0,0.07)] bg-surface p-4 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="mx-auto mb-3 flex h-16 w-full items-end justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const threshold = (i + 1) / 5;
                    const active = hotspot.intensity >= threshold;
                    return (
                      <div
                        key={i}
                        className="w-2 rounded-t-sm transition-colors duration-150"
                        style={{
                          height: `${(i + 1) * 20}%`,
                          backgroundColor: active
                            ? `rgba(43, 92, 230, ${0.25 + hotspot.intensity * 0.55})`
                            : "rgba(15, 23, 42, 0.06)",
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-sm font-semibold text-navy">
                  {hotspot.label}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {hotspot.claimCount} claims
                </p>
                <div className="mt-2 flex justify-center gap-3 text-xs">
                  <span className="text-success">
                    {hotspot.verifiedCount} verified
                  </span>
                  <span className="text-secondary">
                    {hotspot.unverifiedCount} flagged
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-text-muted">
            Bar height reflects unverified claim volume
          </p>
        </div>
      </section>

      <section className="card mb-10 p-6">
        <h2 className="card-title text-xl">Community reporting</h2>
        <p className="card-body-text mt-2 text-sm">
          Report a claim. It appears on the map as pending verification.
        </p>
        <form
          onSubmit={handleReport}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
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
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-150 ${
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
              <p className="card-body-text text-sm">{claim.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <StatusBadge status={claim.status} />
                <span className="text-text-muted">{claim.source}</span>
                {claim.location && (
                  <span className="text-text-muted">{claim.location.label}</span>
                )}
                <span className="text-text-muted">
                  {new Date(claim.extractedAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
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
    <span className={`badge border capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
