import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { mockVoicePassports } from "../data/mockClaims";
import { verifyCall } from "../services/verification";
import type { CallVerificationResult } from "../types";

export default function CallVerification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallVerificationResult | null>(null);
  const [scenario, setScenario] = useState<"verified" | "suspicious">(
    "suspicious",
  );

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);
    try {
      const verification = await verifyCall(scenario);
      setResult(verification);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Verify incoming calls"
        description="Match callers against enrolled voice passports. Assess deepfake risk before sharing sensitive information."
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8">
      <section className="card mb-8 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Enrolled voice passports
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {mockVoicePassports.map((passport) => (
            <li key={passport.voiceprintId} className="card-raised p-4">
              <p className="text-sm font-semibold text-navy">
                {passport.contactName}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                ID: {passport.voiceprintId}
              </p>
              <p className="mt-2 text-xs font-semibold text-success">
                Trust: {Math.round(passport.trustScore * 100)}%
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Simulate incoming call
        </h2>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setScenario("verified")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
              scenario === "verified"
                ? "border-success/40 bg-success/10 text-success"
                : "border-[rgba(0,0,0,0.1)] text-text-muted hover:border-[rgba(0,0,0,0.18)]"
            }`}
          >
            Verified caller
          </button>
          <button
            type="button"
            onClick={() => setScenario("suspicious")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
              scenario === "suspicious"
                ? "border-secondary/40 bg-secondary/10 text-secondary"
                : "border-[rgba(0,0,0,0.1)] text-text-muted hover:border-[rgba(0,0,0,0.18)]"
            }`}
          >
            Suspicious caller
          </button>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="btn-primary mt-6 w-full"
        >
          {loading ? "Running…" : "Run verification"}
        </button>
      </section>

      {loading && <LoadingSpinner label="Analyzing voice…" />}

      {result && !loading && (
        <section className="mt-12 space-y-4">
          <div
            className={`card p-6 ${
              result.isVerified ? "border-success/30" : "border-secondary/30"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Caller
                </p>
                <p className="mt-1 font-serif text-2xl font-medium text-navy">
                  {result.callerName}
                </p>
              </div>
              <span
                className={`badge border ${
                  result.isVerified
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-secondary/25 bg-secondary/10 text-secondary"
                }`}
              >
                {result.isVerified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Deepfake risk score
            </h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Risk level</span>
                <span
                  className={
                    result.deepfakeRiskScore > 0.5
                      ? "font-bold text-secondary"
                      : "font-bold text-success"
                  }
                >
                  {Math.round(result.deepfakeRiskScore * 100)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    result.deepfakeRiskScore > 0.5
                      ? "bg-secondary"
                      : "bg-success"
                  }`}
                  style={{ width: `${result.deepfakeRiskScore * 100}%` }}
                />
              </div>
            </div>
          </div>

          {result.voicePassport && (
            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Matched voice passport
              </h3>
              <p className="mt-2 font-semibold text-navy">
                {result.voicePassport.contactName}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Enrolled{" "}
                {new Date(result.voicePassport.enrolledAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Analysis
            </h3>
            <p className="mt-2 card-body-text text-sm">
              {result.analysis}
            </p>
          </div>

          <div className="card border-accent/20 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
              Recommendation
            </h3>
            <p className="mt-2 card-body-text text-sm">
              {result.recommendation}
            </p>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
