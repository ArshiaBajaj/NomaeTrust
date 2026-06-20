import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/auth/ProfileAvatar";
import ActionSheet from "../components/mobile/ActionSheet";
import IOSAlert from "../components/mobile/IOSAlert";
import NewsShareSetup from "../components/newsWatch/NewsShareSetup";
import { ROUTES } from "../config/navigation";
import { useAppBoot } from "../context/AppBootContext";
import { useAudience } from "../context/AudienceContext";
import {
  profileAvatarUrl,
  profileDisplayName,
  usePortalAuth,
} from "../context/PortalAuthContext";
import { useHaptic } from "../hooks/useHaptic";
import { usePortalLayout } from "../hooks/usePortalLayout";
import {
  isAutoVerifyShareEnabled,
  setAutoVerifyShare,
} from "../utils/shareTarget";

export default function Settings() {
  const haptic = useHaptic();
  const navigate = useNavigate();
  const { resetOnboarding } = useAppBoot();
  const { audience } = useAudience();
  const { individual, platform, updateIndividual, updatePlatform, logout } = usePortalAuth();
  const { shell, content } = usePortalLayout();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetAlert, setResetAlert] = useState(false);
  const [logoutAlert, setLogoutAlert] = useState(false);
  const [autoVerifyShare, setAutoVerifyShareState] = useState(isAutoVerifyShareEnabled);

  const profileName = profileDisplayName(audience, { individual, platform });
  const profileMeta =
    audience === "platform"
      ? `${platform?.teamName ?? "Team"} · ${platform?.role ?? "Moderator"}`
      : `${individual?.city ?? "Atlanta, GA"} · ${individual?.language ?? "English"}`;
  const avatar = profileAvatarUrl(audience, { individual, platform });

  const handlePhoto = (dataUrl: string) => {
    haptic("light");
    if (audience === "platform" && platform) {
      updatePlatform({ avatarUrl: dataUrl });
    } else if (individual) {
      updateIndividual({ avatarUrl: dataUrl });
    }
  };

  const handleLogout = () => {
    haptic("light");
    logout();
    navigate(ROUTES.landing, { replace: true });
  };

  return (
    <div className={shell}>
      <div className={content}>
      <header className="mobile-profile-header">
        <ProfileAvatar
          name={profileName}
          avatarUrl={avatar}
          size="lg"
          editable
          onPhotoSelect={handlePhoto}
        />
        <div>
          <h1 className="mobile-profile-name">{profileName}</h1>
          <p className="mobile-profile-meta">{profileMeta}</p>
        </div>
      </header>

      <section className="mobile-settings-group">
        <h2 className="mobile-section-label">Experience</h2>
        <div className="mobile-settings-list">
          <Link
            to={ROUTES.loginIndividual}
            className={`mobile-settings-row ios-btn ${audience === "individual" ? "mobile-settings-row--active" : ""}`}
            onClick={() => haptic("light")}
          >
            <span>Individuals — major claims</span>
            {audience === "individual" && (
              <span className="mobile-settings-value">Active</span>
            )}
          </Link>
          <Link
            to={ROUTES.loginPlatform}
            className={`mobile-settings-row ios-btn ${audience === "platform" ? "mobile-settings-row--active" : ""}`}
            onClick={() => haptic("light")}
          >
            <span>Platforms — publish gate</span>
            {audience === "platform" && (
              <span className="mobile-settings-value">Active</span>
            )}
          </Link>
          <button
            type="button"
            className="mobile-settings-row ios-btn"
            onClick={() => {
              haptic("light");
              navigate(ROUTES.choose);
            }}
          >
            <span>Switch portal</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </button>
          <button
            type="button"
            className="mobile-settings-row ios-btn"
            onClick={() => {
              haptic("light");
              setLogoutAlert(true);
            }}
          >
            <span>Sign out</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </button>
        </div>
      </section>

      <section className="mobile-settings-group">
        <h2 className="mobile-section-label">News verification</h2>
        <div className="mobile-settings-list">
          <label className="mobile-settings-row mobile-settings-row--toggle">
            <span>Auto-verify shared stories</span>
            <input
              type="checkbox"
              checked={autoVerifyShare}
              onChange={(e) => {
                const on = e.target.checked;
                setAutoVerifyShare(on);
                setAutoVerifyShareState(on);
                haptic("light");
              }}
            />
          </label>
          <Link
            to={ROUTES.newsWatch}
            className="mobile-settings-row ios-btn"
            onClick={() => haptic("light")}
          >
            <span>Set up Share → NomaeTrust</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </Link>
        </div>
        <div className="mt-4">
          <NewsShareSetup compact />
        </div>
      </section>

      <section className="mobile-settings-group">
        <h2 className="mobile-section-label">Preferences</h2>
        <div className="mobile-settings-list">
          <button
            type="button"
            className="mobile-settings-row ios-btn"
            onClick={() => {
              haptic("light");
              setSheetOpen(true);
            }}
          >
            <span>Language</span>
            <span className="mobile-settings-value">English</span>
          </button>
          <div className="mobile-settings-row mobile-settings-row--static">
            <span>Notifications</span>
            <span className="mobile-settings-value">On</span>
          </div>
        </div>
      </section>

      <section className="mobile-settings-group">
        <h2 className="mobile-section-label">About</h2>
        <div className="mobile-settings-list">
          <Link to={ROUTES.disclosure} className="mobile-settings-row ios-btn" onClick={() => haptic("light")}>
            <span>Trust & disclosure</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </Link>
          <Link to={ROUTES.trustCircle} className="mobile-settings-row ios-btn" onClick={() => haptic("light")}>
            <span>Trust Circle (family)</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </Link>
          <button
            type="button"
            className="mobile-settings-row ios-btn"
            onClick={() => {
              haptic("light");
              setResetAlert(true);
            }}
          >
            <span>Replay onboarding</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </button>
        </div>
      </section>

      <section className="mobile-settings-group">
        <div className="mobile-settings-list">
          <div className="mobile-settings-row mobile-settings-row--static">
            <span>Version</span>
            <span className="mobile-settings-value">1.0 · Hackathon</span>
          </div>
        </div>
      </section>

      <p className="mobile-settings-footnote">
        Add to Home Screen for the full app experience — no App Store needed.
      </p>

      <ActionSheet
        open={sheetOpen}
        title="Language"
        message="Demo build — multilingual Action Cards coming soon."
        options={[
          { label: "English", onSelect: () => {} },
          { label: "Somali", onSelect: () => {} },
          { label: "Spanish", onSelect: () => {} },
        ]}
        onClose={() => setSheetOpen(false)}
      />

      <IOSAlert
        open={logoutAlert}
        title="Sign out?"
        message="You'll return to the landing page. Your profile on this device will be cleared."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setLogoutAlert(false);
          handleLogout();
        }}
        onCancel={() => setLogoutAlert(false)}
      />

      <IOSAlert
        open={resetAlert}
        title="Replay onboarding?"
        message="You'll see the welcome screens again next time you open the app."
        confirmLabel="Replay"
        cancelLabel="Cancel"
        onConfirm={() => {
          resetOnboarding();
          setResetAlert(false);
        }}
        onCancel={() => setResetAlert(false)}
      />
      </div>
    </div>
  );
}
