import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import MobileProfileMenu from "../auth/MobileProfileMenu";
import {
  HEADERLESS_ROUTES,
  IMMERSIVE_ROUTES,
  TABLESS_ROUTES,
} from "../../config/navigation";
import { useAppBoot } from "../../context/AppBootContext";
import { usePortalAuth } from "../../context/PortalAuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import InstallPrompt from "./InstallPrompt";
import MobileHeader from "./MobileHeader";
import MobileTabBar from "./MobileTabBar";
import OnboardingFlow from "./OnboardingFlow";
import SplashScreen from "./SplashScreen";

type MobileAppShellProps = {
  children: ReactNode;
};

export default function MobileAppShell({ children }: MobileAppShellProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { phase, completeOnboarding } = useAppBoot();
  const { isAuthenticated } = usePortalAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const immersive = IMMERSIVE_ROUTES.has(pathname);
  const headerless = HEADERLESS_ROUTES.has(pathname);
  const tabless = TABLESS_ROUTES.has(pathname);
  const showTabBar = isAuthenticated && !tabless;

  if (!isMobile) {
    return <>{children}</>;
  }

  if (phase === "splash") {
    return (
      <div className="nt-app">
        <div className="nt-frame">
          <div className="nt-island" aria-hidden />
          <SplashScreen />
        </div>
      </div>
    );
  }

  if (phase === "onboarding") {
    return (
      <div className="nt-app">
        <div className="nt-frame">
          <div className="nt-island" aria-hidden />
          <OnboardingFlow onComplete={completeOnboarding} />
        </div>
      </div>
    );
  }

  return (
    <div className="nt-app">
      <div className={`nt-frame ${immersive ? "nt-frame--immersive" : ""}`}>
        <div className="nt-island" aria-hidden />
        {!immersive && !headerless && (
          <MobileHeader onOpenProfile={() => setProfileMenuOpen(true)} />
        )}
        <div key={pathname} className="nt-scroll">
          {!immersive && <InstallPrompt />}
          {children}
        </div>
        {showTabBar && (
          <MobileTabBar onOpenProfile={() => setProfileMenuOpen(true)} />
        )}
        <MobileProfileMenu
          open={profileMenuOpen}
          onClose={() => setProfileMenuOpen(false)}
        />
        {/* in-frame mount point so modals/sheets stay inside the phone */}
        <div id="nt-modal-root" />
      </div>
    </div>
  );
}
