import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FamilyMemberRing from "../components/FamilyMemberRing";
import InviteCodeCard from "../components/InviteCodeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTrustCircle } from "../context/TrustCircleContext";
import {
  enrollVoicePassport,
  loadVoicePassports,
  seedPassportsFromMembers,
} from "../services/voicePassport";
import { verifyCallApi } from "../services/verifyCall";
import type { CallVerificationResult, VoicePassport } from "../types";

type CallPhase = "idle" | "ringing" | "challenge" | "result";

export default function TrustCircleDashboard() {
  const navigate = useNavigate();
  const { me, leave } = useTrustCircle();
  const [passports, setPassports] = useState<VoicePassport[]>([]);
  const [scenario, setScenario] = useState<"registered" | "unregistered">("unregistered");
  const [selectedPassport, setSelectedPassport] = useState<VoicePassport | null>(null);
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [challengeInput, setChallengeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallVerificationResult | null>(null);
  const [enrollName, setEnrollName] = useState("");

  const familyId = me?.family.id ?? "";
  const trustPhrase = me?.trustPhrase ?? "";
  const secondsLeft = me?.secondsUntilRotation ?? 0;

  useEffect(() => {
    if (!familyId || !me) return;
    const memberNames = me.family.members.map((m) => m.displayName);
    const loaded = loadVoicePassports(familyId);
    const passportsList =
      loaded.length > 0 ? loaded : seedPassportsFromMembers(familyId, memberNames);
    setPassports(passportsList);
    setSelectedPassport(passportsList[0] ?? null);
  }, [familyId, me]);

  const handleLeave = async () => {
    await leave();
    navigate("/trust-circle/login", { replace: true });
  };

  const handleIncomingCall = () => {
    setResult(null);
    setChallengeInput("");
    setPhase("ringing");
  };

  const handleRunVerification = async () => {
    setLoading(true);
    try {
      const verification = await verifyCallApi({
        scenario,
        challengeResponse: challengeInput,
        expectedChallengeCode: trustPhrase,
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
    if (!enrollName.trim() || !familyId) return;
    const passport = enrollVoicePassport(familyId, enrollName.trim());
    const updated = [passport, ...passports];
    setPassports(updated);
    setSelectedPassport(passport);
    setEnrollName("");
  };

  if (!me) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner label="Loading Trust Circle…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-28 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              {me.family.name}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium text-navy">
              Family Trust Circle
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Signed in as <strong>{me.member.displayName}</strong>
              {me.member.role === "admin" ? " (admin)" : ""}
            </p>
          </div>
          <button type="button" onClick={handleLeave} className="btn-secondary text-sm">
            Leave circle
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="card p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Connected members
            </h2>
            <div className="mt-6">
              <FamilyMemberRing
                members={me.family.members}
                currentMemberId={me.member.id}
              />
            </div>
          </section>

          <InviteCodeCard
            inviteCode={me.family.inviteCode}
            familyName={me.family.name}
          />
        </div>

        <section className="card mt-8 border-emerald-500/20 bg-emerald-500/5 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Today&apos;s verify words (synced)
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            All {me.family.members.length} members see these same words. Ask callers to
            repeat them before trusting urgent requests.
          </p>
          <p className="mt-4 font-mono text-3xl font-bold tracking-wide text-navy">
            {trustPhrase}
          </p>
          <p className="mt-2 text-xs text-text-muted">Refreshes in {secondsLeft}s</p>
        </section>

        <section className="card mt-8 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Voice passports (on-device)
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {passports.map((passport) => (
              <li key={passport.voiceprintId} className="card-raised p-4">
                <p className="text-sm font-semibold text-navy">{passport.contactName}</p>
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
              placeholder="Enroll voice passport"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-secondary px-4 py-2 text-sm">
              Enroll
            </button>
          </form>
        </section>

        <section className="card mt-8 p-6">
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
              <p className="text-lg font-semibold text-navy animate-pulse">Incoming call</p>
              <p className="mt-2 text-sm text-text-muted">
                {scenario === "registered"
                  ? selectedPassport?.contactName
                  : "Unknown caller — claims social services"}
              </p>
              <button
                type="button"
                onClick={() => setPhase("challenge")}
                className="btn-primary mt-4"
              >
                Verify (one tap)
              </button>
            </div>
          )}

          {phase === "challenge" && (
            <div className="mt-6 space-y-4 rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised p-6">
              <p className="text-sm font-semibold text-navy">Trust Circle challenge</p>
              <p className="text-sm text-text-muted">
                Ask the caller to repeat:{" "}
                <span className="font-mono font-bold text-accent">{trustPhrase}</span>
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
                {loading ? "Analyzing…" : "Complete verification"}
              </button>
            </div>
          )}
        </section>

        {loading && <LoadingSpinner label="Running verification…" />}

        {result && phase === "result" && !loading && (
          <section className="mt-8 space-y-4">
            <div
              className={`card p-6 ${
                result.isVerified ? "border-success/30" : "border-secondary/30"
              }`}
            >
              <p className="text-xs font-semibold uppercase text-text-muted">Caller</p>
              <p className="mt-1 font-serif text-2xl text-navy">{result.callerName}</p>
              <p className="mt-2 text-sm">
                {result.isVerified ? "Verified" : "Not verified"} · Trust Circle{" "}
                {result.challengePassed ? "passed" : "failed"}
              </p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-text-body">{result.recommendation}</p>
            </div>
            {result.detectedClaim && (
              <div className="card border-blue-500/20 bg-blue-500/5 p-6">
                <p className="text-sm font-semibold text-navy">Claim detected</p>
                <p className="mt-2 text-sm">{result.detectedClaim}</p>
                <div className="mt-4 flex gap-3">
                  <Link to="/stress" className="btn-primary text-sm">
                    Get Action Card
                  </Link>
                  <Link to="/trust-map" className="btn-secondary text-sm">
                    Confusion Map
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
