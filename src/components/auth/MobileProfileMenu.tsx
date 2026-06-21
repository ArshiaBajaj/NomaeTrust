import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  INDIVIDUAL_TABS,
  PLATFORM_TABS,
  ROUTES,
  type TabItem,
} from "../../config/navigation";
import { useAudience } from "../../context/AudienceContext";
import {
  profileAvatarUrl,
  profileDisplayName,
  usePortalAuth,
} from "../../context/PortalAuthContext";
import { useHaptic } from "../../hooks/useHaptic";
import ProfileAvatar from "./ProfileAvatar";

type MobileProfileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileProfileMenu({ open, onClose }: MobileProfileMenuProps) {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const { audience } = useAudience();
  const { individual, platform, updateIndividual, updatePlatform, logout } = usePortalAuth();

  const name = profileDisplayName(audience, { individual, platform });
  const avatar = profileAvatarUrl(audience, { individual, platform });
  const tabs = audience === "platform" ? PLATFORM_TABS : INDIVIDUAL_TABS;
  const navTabs = tabs.filter((t) => t.action !== "menu" && t.action !== "queue");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    onClose();
    navigate(ROUTES.landing, { replace: true });
  };

  if (!open) return null;

  return createPortal(
    <div className="profile-menu-root" role="presentation" onClick={onClose}>
      <div
        className="profile-menu-sheet"
        role="dialog"
        aria-label="Profile menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-menu-handle" aria-hidden />

        <header className="profile-menu-header">
          <ProfileAvatar
            name={name}
            avatarUrl={avatar}
            size="lg"
            editable
            onPhotoSelect={handlePhoto}
          />
          <div>
            <p className="profile-menu-name">{name}</p>
            <p className="profile-menu-meta">
              {audience === "platform"
                ? `${platform?.role ?? "Moderator"} · ${platform?.teamName ?? ""}`
                : `${individual?.city ?? ""} · ${individual?.language ?? ""}`}
            </p>
          </div>
        </header>

        <nav className="profile-menu-nav">
          {navTabs.map((tab: TabItem) => (
            <Link
              key={tab.to}
              to={tab.to ?? ROUTES.settings}
              className="profile-menu-link"
              onClick={() => {
                haptic("light");
                onClose();
              }}
            >
              <span>{tab.label}</span>
              <span aria-hidden>›</span>
            </Link>
          ))}
          <Link
            to={ROUTES.settings}
            className="profile-menu-link"
            onClick={() => {
              haptic("light");
              onClose();
            }}
          >
            <span>Settings</span>
            <span aria-hidden>›</span>
          </Link>
          <Link
            to={ROUTES.choose}
            className="profile-menu-link"
            onClick={() => {
              haptic("light");
              onClose();
            }}
          >
            <span>Switch portal</span>
            <span aria-hidden>›</span>
          </Link>
        </nav>

        <button type="button" className="profile-menu-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>,
    document.getElementById("nt-modal-root") ?? document.body,
  );
}
