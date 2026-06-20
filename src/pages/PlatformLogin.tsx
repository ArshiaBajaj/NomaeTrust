import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/auth/ProfileAvatar";
import PortalLoginShell from "../components/auth/PortalLoginShell";
import { ROUTES } from "../config/navigation";
import { usePortalAuth } from "../context/PortalAuthContext";
import { useHaptic } from "../hooks/useHaptic";

const ROLES = ["Moderator", "Trust & Safety", "Editor", "Admin"];

export default function PlatformLogin() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const { loginPlatform, platform } = usePortalAuth();
  const [orgName, setOrgName] = useState(platform?.orgName ?? "");
  const [teamName, setTeamName] = useState(platform?.teamName ?? "");
  const [workEmail, setWorkEmail] = useState(platform?.workEmail ?? "");
  const [role, setRole] = useState(platform?.role ?? "Moderator");
  const [avatarUrl, setAvatarUrl] = useState(platform?.avatarUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (platform) {
      navigate(ROUTES.platform, { replace: true });
    }
  }, [platform, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !teamName.trim() || !workEmail.trim()) {
      setError("Organization, team, and work email are required.");
      return;
    }
    if (!workEmail.includes("@")) {
      setError("Enter a valid work email.");
      return;
    }
    haptic("success");
    loginPlatform({
      orgName: orgName.trim(),
      teamName: teamName.trim(),
      workEmail: workEmail.trim(),
      role,
      avatarUrl,
    });
    navigate(ROUTES.platform, { replace: true });
  };

  if (platform) {
    return <Navigate to={ROUTES.platform} replace />;
  }

  return (
    <PortalLoginShell
      accent="platform"
      eyebrow="Platform portal"
      title="Company sign-in"
      description="Access the publish gate, review queue, and policy controls for your organization."
    >
      <form onSubmit={handleSubmit} className="portal-login-form">
        <div className="portal-login-avatar-row">
          <ProfileAvatar
            name={orgName || "Team"}
            avatarUrl={avatarUrl}
            size="lg"
            editable
            onPhotoSelect={(url) => {
              setAvatarUrl(url);
              haptic("light");
            }}
          />
          <p className="portal-login-avatar-hint">Tap to add a team logo or photo</p>
        </div>

        <label className="nw-label" htmlFor="plat-org">
          Organization
        </label>
        <input
          id="plat-org"
          className="nw-input"
          placeholder="Reddit Mod Team · Discord Server · Publisher"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />

        <label className="nw-label mt-4" htmlFor="plat-team">
          Team name
        </label>
        <input
          id="plat-team"
          className="nw-input"
          placeholder="r/Atlanta moderators"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <label className="nw-label mt-4" htmlFor="plat-email">
          Work email
        </label>
        <input
          id="plat-email"
          type="email"
          className="nw-input"
          placeholder="mod@company.com"
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          autoComplete="email"
        />

        <label className="nw-label mt-4" htmlFor="plat-role">
          Your role
        </label>
        <select
          id="plat-role"
          className="nw-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {error && (
          <p className="mt-3 text-sm text-secondary" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="ios-btn ios-btn-primary mt-6 w-full">
          Open publish gate
        </button>

        <p className="portal-login-hint mt-4">
          Demo login for hackathon judges. Production would use SSO or API keys via{" "}
          <code>X-NomaeTrust-Key</code>.
        </p>
      </form>
    </PortalLoginShell>
  );
}
