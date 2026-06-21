import { Link, useLocation, useNavigate } from "react-router-dom";
import { homeForAudience, pageTitle, ROUTES } from "../../config/navigation";
import { useAudience } from "../../context/AudienceContext";
import {
  profileAvatarUrl,
  profileDisplayName,
  usePortalAuth,
} from "../../context/PortalAuthContext";
import ProfileAvatar from "../auth/ProfileAvatar";
import NomaeTrustLogo from "../NomaeTrustLogo";

type MobileHeaderProps = {
  onOpenProfile?: () => void;
};

export default function MobileHeader({ onOpenProfile }: MobileHeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { audience } = useAudience();
  const { individual, platform, isAuthenticated } = usePortalAuth();
  const title = pageTitle(pathname);
  const homeTo = homeForAudience(audience);
  const name = profileDisplayName(audience, { individual, platform });
  const avatar = profileAvatarUrl(audience, { individual, platform });
  const noBackRoutes: string[] = [
    ROUTES.landing,
    ROUTES.individual,
    ROUTES.platform,
    ROUTES.settings,
    ROUTES.choose,
    ROUTES.loginIndividual,
    ROUTES.loginPlatform,
  ];
  const showBack = !noBackRoutes.includes(pathname);

  return (
    <header className="nt-topbar">
      {showBack ? (
        <button
          type="button"
          className="nt-topbar-btn nt-press"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      ) : (
        <Link to={homeTo} className="nt-topbar-btn nt-press" aria-label="NomaeTrust home">
            <NomaeTrustLogo size="sm" />
        </Link>
      )}

      <h1 className="nt-topbar-title">{title}</h1>

      {isAuthenticated && onOpenProfile ? (
        <button
          type="button"
          className="nt-topbar-btn nt-press"
          aria-label="Open profile menu"
          onClick={onOpenProfile}
        >
          <ProfileAvatar name={name} avatarUrl={avatar} size="sm" />
        </button>
      ) : (
        <Link to={ROUTES.settings} className="nt-topbar-btn nt-press" aria-label="Settings">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.12a7.5 7.5 0 0 1 15 0" />
          </svg>
        </Link>
      )}
    </header>
  );
}
