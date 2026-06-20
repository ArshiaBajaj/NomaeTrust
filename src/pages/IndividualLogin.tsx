import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/auth/ProfileAvatar";
import PortalLoginShell from "../components/auth/PortalLoginShell";
import { ROUTES } from "../config/navigation";
import { usePortalAuth } from "../context/PortalAuthContext";
import { useHaptic } from "../hooks/useHaptic";

const LANGUAGES = ["English", "Somali", "Spanish", "English + Somali"];

export default function IndividualLogin() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const { loginIndividual, individual } = usePortalAuth();
  const [displayName, setDisplayName] = useState(individual?.displayName ?? "");
  const [city, setCity] = useState(individual?.city ?? "Atlanta, GA");
  const [language, setLanguage] = useState(individual?.language ?? "English");
  const [avatarUrl, setAvatarUrl] = useState(individual?.avatarUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (individual) {
      navigate(ROUTES.individual, { replace: true });
    }
  }, [individual, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    haptic("success");
    loginIndividual({
      displayName: displayName.trim(),
      city: city.trim() || "Atlanta, GA",
      language,
      avatarUrl,
    });
    navigate(ROUTES.individual, { replace: true });
  };

  if (individual) {
    return <Navigate to={ROUTES.individual} replace />;
  }

  return (
    <PortalLoginShell
      accent="individual"
      eyebrow="Individual portal"
      title="Welcome back"
      description="Set up your profile to see major claims near you, verify headlines, and share Action Cards with family."
    >
      <form onSubmit={handleSubmit} className="portal-login-form">
        <div className="portal-login-avatar-row">
          <ProfileAvatar
            name={displayName || "You"}
            avatarUrl={avatarUrl}
            size="lg"
            editable
            onPhotoSelect={(url) => {
              setAvatarUrl(url);
              haptic("light");
            }}
          />
          <p className="portal-login-avatar-hint">Tap to add a profile photo</p>
        </div>

        <label className="nw-label" htmlFor="ind-name">
          Your name
        </label>
        <input
          id="ind-name"
          className="nw-input"
          placeholder="Fatima"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
        />

        <label className="nw-label mt-4" htmlFor="ind-city">
          City / neighborhood
        </label>
        <input
          id="ind-city"
          className="nw-input"
          placeholder="Atlanta, GA"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <label className="nw-label mt-4" htmlFor="ind-lang">
          Preferred language
        </label>
        <select
          id="ind-lang"
          className="nw-input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        {error && (
          <p className="mt-3 text-sm text-secondary" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="ios-btn ios-btn-primary mt-6 w-full">
          Enter NomaeTrust
        </button>

        <p className="portal-login-hint mt-4">
          Demo login — your profile stays on this device. No password required for hackathon
          demo.
        </p>
      </form>
    </PortalLoginShell>
  );
}
