import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NomaeTrustLogo from "../components/NomaeTrustLogo";
import { ROUTES } from "../config/navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTrustCircle } from "../context/TrustCircleContext";
import { formatInviteCodeInput } from "../services/trustCircleApi";

type Tab = "create" | "join";

export default function TrustCircleLogin() {
  const navigate = useNavigate();
  const { createFamily, joinFamily, isAuthenticated, loading: authLoading } = useTrustCircle();
  const [tab, setTab] = useState<Tab>("create");
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(ROUTES.trustCircle, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-bg to-white">
        <LoadingSpinner label="Loading…" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "create") {
        if (!familyName.trim() || !displayName.trim()) {
          setError("Family name and your name are required.");
          return;
        }
        await createFamily(familyName.trim(), displayName.trim());
      } else {
        if (!inviteCode.trim() || !displayName.trim()) {
          setError("Invite code and your name are required.");
          return;
        }
        await joinFamily(inviteCode.trim(), displayName.trim());
      }
      navigate(ROUTES.trustCircle, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-bg to-white">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 lg:px-12">
          <Link to={ROUTES.landing} className="inline-block w-fit" aria-label="NomaeTrust home">
            <NomaeTrustLogo size="md" />
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Family Trust Circle
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-navy">
            Connect your family before the next suspicious call.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Create a private circle or join with an invite code. Everyone in the
            circle sees the same 4-word verify phrase that rotates every 60 seconds.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-text-body">
            <li className="flex gap-2">
              <span className="text-emerald-600">1.</span>
              Mom creates the circle and shares the invite code
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">2.</span>
              Cousin joins on their phone with the same code
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">3.</span>
              Both see identical words during a suspicious call
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-10">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
            <div className="mb-6 flex rounded-xl bg-surface-raised p-1">
              {(["create", "join"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setError(null);
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize ${
                    tab === t
                      ? "bg-white text-navy shadow-sm"
                      : "text-text-muted"
                  }`}
                >
                  {t === "create" ? "Create family" : "Join family"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "create" && (
                <div>
                  <label className="text-xs font-semibold uppercase text-text-muted">
                    Family name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. Fatima's Family"
                    className="input-field mt-2 w-full"
                  />
                </div>
              )}

              {tab === "join" && (
                <div>
                  <label className="text-xs font-semibold uppercase text-text-muted">
                    Invite code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(formatInviteCodeInput(e.target.value))}
                    placeholder="ABC-1234"
                    className="input-field mt-2 w-full font-mono uppercase tracking-widest"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase text-text-muted">
                  Your name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Fatima"
                  className="input-field mt-2 w-full"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-secondary">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading
                  ? "Connecting…"
                  : tab === "create"
                    ? "Create circle"
                    : "Join circle"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-text-muted">
              No password needed — invite code connects your family for this demo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
