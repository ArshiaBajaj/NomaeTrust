import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAppBoot } from "../../context/AppBootContext";
import InstallPrompt from "./InstallPrompt";
import MobileHeader from "./MobileHeader";
import MobileTabBar from "./MobileTabBar";
import OnboardingFlow from "./OnboardingFlow";
import SplashScreen from "./SplashScreen";

const IMMERSIVE_ROUTES = new Set(["/detective"]);
const HEADERLESS_ROUTES = new Set(["/"]);

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { phase, completeOnboarding } = useAppBoot();
  const immersive = IMMERSIVE_ROUTES.has(pathname);

  if (phase === "splash") {
    return (
      <div className="nt-app">
        <div className="nt-frame">
          <SplashScreen />
        </div>
      </div>
    );
  }

  if (phase === "onboarding") {
    return (
      <div className="nt-app">
        <div className="nt-frame">
          <OnboardingFlow onComplete={completeOnboarding} />
        </div>
      </div>
    );
  }

  return (
    <div className="nt-app">
      <div className={`nt-frame ${immersive ? "nt-frame--immersive" : ""}`}>
        {!immersive && !HEADERLESS_ROUTES.has(pathname) && <MobileHeader />}
        <div
          key={pathname}
          className={`nt-scroll ${immersive ? "nt-scroll--locked" : ""}`}
        >
          {!immersive && <InstallPrompt />}
          {children}
        </div>
        {!immersive && <MobileTabBar />}
      </div>
    </div>
  );
}
