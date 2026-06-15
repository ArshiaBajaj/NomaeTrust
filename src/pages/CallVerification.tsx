import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
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
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-20 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          Call Verification
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Family voice verification
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Simulate an incoming call and verify the caller against enrolled voice
          passports. Detect deepfake risk before sharing sensitive information.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="text-sm font-medium text-zinc-300">
          Enrolled Voice Passports
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {mockVoicePassports.map((passport) => (
            <li
              key={passport.voiceprintId}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
            >
              <p className="text-sm font-medium text-white">
                {passport.contactName}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                ID: {passport.voiceprintId}
              </p>
              <p className="mt-2 text-xs text-emerald-400">
                Trust score: {Math.round(passport.trustScore * 100)}%
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <h2 className="text-sm font-medium text-zinc-300">
          Simulate Incoming Call
        </h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setScenario("verified")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              scenario === "verified"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-zinc-400 hover:border-white/20"
            }`}
          >
            Verified caller (Mom)
          </button>
          <button
            type="button"
            onClick={() => setScenario("suspicious")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              scenario === "suspicious"
                ? "border-red-500/50 bg-red-500/10 text-red-300"
                : "border-white/10 text-zinc-400 hover:border-white/20"
            }`}
          >
            Suspicious caller (AI impersonation)
          </button>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Analyzing call…" : "Run Call Verification"}
        </button>
      </section>

      {loading && <LoadingSpinner label="Analyzing voice biometrics…" />}

      {result && !loading && (
        <section className="mt-10 space-y-6">
          <div
            className={`rounded-2xl border p-6 ${
              result.isVerified
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">Caller</p>
                <p className="text-xl font-semibold text-white">
                  {result.callerName}
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  result.isVerified
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {result.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <h3 className="text-sm font-medium text-zinc-300">
              Deepfake Risk Score
            </h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Risk level</span>
                <span
                  className={
                    result.deepfakeRiskScore > 0.5
                      ? "font-semibold text-red-400"
                      : "font-semibold text-emerald-400"
                  }
                >
                  {Math.round(result.deepfakeRiskScore * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.deepfakeRiskScore > 0.5
                      ? "bg-red-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${result.deepfakeRiskScore * 100}%` }}
                />
              </div>
            </div>
          </div>

          {result.voicePassport && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <h3 className="text-sm font-medium text-zinc-300">
                Matched Voice Passport
              </h3>
              <p className="mt-2 text-white">{result.voicePassport.contactName}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Enrolled {new Date(result.voicePassport.enrolledAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <h3 className="text-sm font-medium text-zinc-300">Analysis</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {result.analysis}
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
            <h3 className="text-sm font-medium text-indigo-300">
              Recommendation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {result.recommendation}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
