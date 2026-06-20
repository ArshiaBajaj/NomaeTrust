import { Link, useLocation } from "react-router-dom";
import { homeForAudience, pageTitle, ROUTES } from "../../config/navigation";
import { useAudience } from "../../context/AudienceContext";
import {
  profileAvatarUrl,
  profileDisplayName,
  usePortalAuth,
} from "../../context/PortalAuthContext";
import ProfileAvatar from "../auth/ProfileAvatar";

type MobileHeaderProps = {
  onOpenProfile?: () => void;
};

export default function MobileHeader({ onOpenProfile }: MobileHeaderProps) {
  const { pathname } = useLocation();
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
    <header className="mobile-header">
      {showBack ? (
        <button
          type="button"
          className="mobile-header-back ios-btn"
          aria-label="Go back"
          onClick={() => window.history.back()}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      ) : (
        <Link to={homeTo} className="mobile-header-logo ios-btn" aria-label="NomaeTrust home">
          <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </Link>
      )}
      <h1 className="mobile-header-title">{title}</h1>
      {isAuthenticated && onOpenProfile ? (
        <button
          type="button"
          className="mobile-header-action ios-btn"
          aria-label="Open profile menu"
          onClick={onOpenProfile}
        >
          <ProfileAvatar name={name} avatarUrl={avatar} size="sm" />
        </button>
      ) : (
        <Link to={ROUTES.settings} className="mobile-header-action ios-btn" aria-label="Settings">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        </Link>
      )}
    </header>
  );
}
