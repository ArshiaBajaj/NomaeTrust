import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAppBoot } from "../../context/AppBootContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import InstallPrompt from "./InstallPrompt";
import MobileHeader from "./MobileHeader";
import MobilePageTransition from "./MobilePageTransition";
import MobileTabBar from "./MobileTabBar";
import OnboardingFlow from "./OnboardingFlow";
import SplashScreen from "./SplashScreen";

type MobileAppShellProps = {
  children: ReactNode;
};

const IMMERSIVE_ROUTES = new Set(["/detective"]);
const HEADERLESS_ROUTES = new Set(["/", "/settings"]);

export default function MobileAppShell({ children }: MobileAppShellProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { phase, completeOnboarding } = useAppBoot();
  const immersive = IMMERSIVE_ROUTES.has(pathname);
  const headerless = HEADERLESS_ROUTES.has(pathname);

  if (!isMobile) {
    return <>{children}</>;
  }

  if (phase === "splash") {
    return (
      <div className="mobile-app-root">
        <div className="mobile-app-frame mobile-app-frame--splash">
          <SplashScreen />
        </div>
      </div>
    );
  }

  if (phase === "onboarding") {
    return (
      <div className="mobile-app-root">
        <div className="mobile-app-frame mobile-app-frame--immersive">
          <OnboardingFlow onComplete={completeOnboarding} />
        </div>
      </div>
    );
  }

  return (
    <div className={`mobile-app-root ${immersive ? "mobile-app-root--immersive" : ""}`}>
      <div className={`mobile-app-frame ${immersive ? "mobile-app-frame--immersive" : ""}`}>
        {!immersive && !headerless && <MobileHeader />}
        <InstallPrompt />
        <div className={`mobile-app-content ${immersive ? "mobile-app-content--immersive" : ""}`}>
          <MobilePageTransition>{children}</MobilePageTransition>
        </div>
        {!immersive && <MobileTabBar />}
      </div>
    </div>
  );
}
