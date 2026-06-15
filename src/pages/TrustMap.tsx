import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
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
      <div className="px-6 pt-28">
        <LoadingSpinner label="Loading trust map data…" size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-20 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
          Community Trust Map
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Misinformation hotspots
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Visualize verified and unverified claims across communities. Help
          organizations respond faster to emerging misinformation.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Heatmap Visualization
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#0d1117] p-6">
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(239,68,68,0.2) 0%, transparent 40%)",
            }}
          />
          <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="relative flex flex-col items-center rounded-xl border border-white/8 p-4 text-center transition-all hover:border-white/15"
                style={{
                  background: `rgba(239, 68, 68, ${hotspot.intensity * 0.25})`,
                }}
              >
                <div
                  className="mb-3 h-16 w-16 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(239,68,68,${hotspot.intensity}) 0%, rgba(239,68,68,0) 70%)`,
                    boxShadow: `0 0 ${hotspot.intensity * 40}px rgba(239,68,68,${hotspot.intensity * 0.5})`,
                  }}
                />
                <p className="text-sm font-medium text-white">{hotspot.label}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {hotspot.claimCount} claims
                </p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-emerald-400">
                    {hotspot.verifiedCount} ✓
                  </span>
                  <span className="text-red-400">
                    {hotspot.unverifiedCount} ✗
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="relative mt-6 text-center text-xs text-zinc-500">
            Heat intensity reflects unverified claim volume · Mock geographic data
          </p>
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">Community Reporting</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Report a claim you've encountered. It will appear in the map as pending
          verification.
        </p>
        <form onSubmit={handleReport} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Describe the claim or rumor…"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={reporting || !reportText.trim()}
            className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-400 disabled:opacity-50"
          >
            {reporting ? "Reporting…" : "Submit Report"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Claims Feed</h2>
          <div className="flex gap-2">
            {(["all", "verified", "unverified"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-3">
          {filteredClaims.map((claim) => (
            <li
              key={claim.id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
            >
              <p className="text-sm text-zinc-300">{claim.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <StatusBadge status={claim.status} />
                <span className="text-zinc-500">{claim.source}</span>
                {claim.location && (
                  <span className="text-zinc-500">{claim.location.label}</span>
                )}
                <span className="text-zinc-600">
                  {new Date(claim.extractedAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: Claim["status"] }) {
  const styles = {
    verified: "bg-emerald-500/15 text-emerald-400",
    unverified: "bg-red-500/15 text-red-400",
    disputed: "bg-amber-500/15 text-amber-400",
    pending: "bg-zinc-500/15 text-zinc-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
