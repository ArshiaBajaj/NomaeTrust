import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import {
  enrollVoicePassport,
  getFamilyPairingCode,
  loadVoicePassports,
} from "../services/voicePassport";
import { verifyCallApi } from "../services/verifyCall";
import {
  formatTrustWords,
  getRotatingTrustWords,
  getSecondsUntilRotation,
} from "../utils/trustCircle";
import type { CallVerificationResult, VoicePassport } from "../types";

type CallPhase = "idle" | "ringing" | "challenge" | "result";

export default function CallVerification() {
  const [passports, setPassports] = useState<VoicePassport[]>([]);
  const [scenario, setScenario] = useState<"registered" | "unregistered">("unregistered");
  const [selectedPassport, setSelectedPassport] = useState<VoicePassport | null>(null);
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [challengeInput, setChallengeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallVerificationResult | null>(null);
  const [enrollName, setEnrollName] = useState("");
  const [trustWords, setTrustWords] = useState<string[]>(getRotatingTrustWords());
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilRotation());
  const pairingCode = getFamilyPairingCode();

  useEffect(() => {
    const loaded = loadVoicePassports();
    setPassports(loaded);
    setSelectedPassport(loaded[0] ?? null);
  }, []);

  useEffect(() => {
    const tick = () => {
      setTrustWords(getRotatingTrustWords());
      setSecondsLeft(getSecondsUntilRotation());
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const familyCode = formatTrustWords(trustWords);

  const handleIncomingCall = () => {
    setResult(null);
    setChallengeInput("");
    setPhase("ringing");
  };

  const handleStartVerify = () => {
    setPhase("challenge");
  };

  const handleRunVerification = async () => {
    setLoading(true);
    try {
      const verification = await verifyCallApi({
        scenario,
        challengeResponse: challengeInput,
        expectedChallengeCode: familyCode,
        passport: scenario === "registered" ? selectedPassport : null,
      });
      setResult(verification);
      setPhase("result");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim()) return;
    const passport = enrollVoicePassport(enrollName.trim());
    const updated = [passport, ...passports];
    setPassports(updated);
    setSelectedPassport(passport);
    setEnrollName("");
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Family Trust Circle"
        description="Rotating 4-word verify codes, voice passport matching, and deepfake risk — with automatic rumor pipeline when claims are detected."
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8">
        <section className="card mb-8 border-emerald-500/20 bg-emerald-500/5 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Trust Circle — rotating family code
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Share your pairing code with family once. Everyone sees the same 4-word code that
            rotates every 60 seconds — ask callers to repeat it before trusting urgent requests.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-emerald-500/30 bg-white px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Today&apos;s words
              </p>
              <p className="mt-1 font-mono text-xl font-bold tracking-wide text-navy">
                {familyCode}
              </p>
              <p className="mt-1 text-xs text-text-muted">Refreshes in {secondsLeft}s</p>
            </div>
            <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Pairing code (share once)
              </p>
              <p className="mt-1 font-mono text-sm text-navy">{pairingCode}</p>
            </div>
          </div>
        </section>

        <section className="card mb-8 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Enrolled voice passports (on-device)
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {passports.map((passport) => (
              <li key={passport.voiceprintId} className="card-raised p-4">
                <p className="text-sm font-semibold text-navy">{passport.contactName}</p>
                <p className="mt-1 text-xs text-text-muted">ID: {passport.voiceprintId}</p>
                <p className="mt-2 text-xs font-semibold text-success">
                  Trust: {Math.round(passport.trustScore * 100)}%
                </p>
              </li>
            ))}
          </ul>
          <form onSubmit={handleEnroll} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={enrollName}
              onChange={(e) => setEnrollName(e.target.value)}
              placeholder="Enroll family member name"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-secondary px-4 py-2 text-sm">
              Enroll passport
            </button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Simulate incoming call
          </h2>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setScenario("registered")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                scenario === "registered"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-[rgba(0,0,0,0.1)] text-text-muted"
              }`}
            >
              Registered contact
            </button>
            <button
              type="button"
              onClick={() => setScenario("unregistered")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                scenario === "unregistered"
                  ? "border-secondary/40 bg-secondary/10 text-secondary"
                  : "border-[rgba(0,0,0,0.1)] text-text-muted"
              }`}
            >
              Unregistered / suspicious
            </button>
          </div>

          {scenario === "registered" && (
            <select
              value={selectedPassport?.voiceprintId ?? ""}
              onChange={(e) =>
                setSelectedPassport(
                  passports.find((p) => p.voiceprintId === e.target.value) ?? null,
                )
              }
              className="input-field mt-4 w-full"
            >
              {passports.map((p) => (
                <option key={p.voiceprintId} value={p.voiceprintId}>
                  {p.contactName}
                </option>
              ))}
            </select>
          )}

          {phase === "idle" && (
            <button type="button" onClick={handleIncomingCall} className="btn-primary mt-6 w-full">
              Incoming call…
            </button>
          )}

          {phase === "ringing" && (
            <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
              <p className="text-lg font-semibold text-navy animate-pulse">
                Incoming call
              </p>
              <p className="mt-2 text-sm text-text-muted">
                {scenario === "registered"
                  ? selectedPassport?.contactName
                  : "Unknown caller — claims social services"}
              </p>
              <button type="button" onClick={handleStartVerify} className="btn-primary mt-4">
                Verify (one tap)
              </button>
            </div>
          )}

          {phase === "challenge" && (
            <div className="mt-6 space-y-4 rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-6">
              <p className="text-sm font-semibold text-navy">
                Trust Circle challenge
              </p>
              <p className="text-sm text-text-muted">
                Ask the caller to repeat your family&apos;s 4 words:{" "}
                <span className="font-mono font-bold text-accent">{familyCode}</span>
              </p>
              <input
                type="text"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                placeholder="Enter the 4 words they said"
                className="input-field w-full"
              />
              <button
                type="button"
                onClick={handleRunVerification}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Analyzing voice…" : "Complete verification"}
              </button>
            </div>
          )}
        </section>

        {loading && <LoadingSpinner label="Running speaker + deepfake analysis…" />}

        {result && phase === "result" && !loading && (
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
                  {result.isVerified ? "Match" : "Not Match"}
                </span>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Deepfake risk score
              </h3>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Risk</span>
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
                    className={`h-full rounded-full ${
                      result.deepfakeRiskScore > 0.5 ? "bg-secondary" : "bg-success"
                    }`}
                    style={{ width: `${result.deepfakeRiskScore * 100}%` }}
                  />
                </div>
              </div>
              {result.challengePassed !== null && (
                <p className="mt-3 text-sm text-text-muted">
                  Trust Circle: {result.challengePassed ? "Passed" : "Failed"}
                </p>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Analysis
              </h3>
              <p className="mt-2 text-sm text-text-body">{result.analysis}</p>
            </div>

            <div className="card border-accent/20 p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                Recommendation
              </h3>
              <p className="mt-2 text-sm text-text-body">{result.recommendation}</p>
            </div>

            {result.detectedClaim && (
              <div className="card border-blue-500/20 bg-blue-500/5 p-6">
                <h3 className="text-sm font-semibold text-navy">
                  Claim detected — rumor pipeline triggered
                </h3>
                <p className="mt-2 text-sm text-text-body">{result.detectedClaim}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to="/stress" className="btn-primary text-sm">
                    Get Action Card
                  </Link>
                  <Link to="/trust-map" className="btn-secondary text-sm">
                    View Confusion Map
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
