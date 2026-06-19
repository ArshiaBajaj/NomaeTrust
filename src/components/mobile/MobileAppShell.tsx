import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import InstallPrompt from "./InstallPrompt";
import MobileHeader from "./MobileHeader";
import MobileTabBar from "./MobileTabBar";

type MobileAppShellProps = {
  children: ReactNode;
};

const IMMERSIVE_ROUTES = new Set(["/detective"]);

export default function MobileAppShell({ children }: MobileAppShellProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const immersive = IMMERSIVE_ROUTES.has(pathname);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={`mobile-app-root ${immersive ? "mobile-app-root--immersive" : ""}`}>
      <div className="mobile-app-frame">
        {!immersive && <MobileHeader />}
        <InstallPrompt />
        <div className={`mobile-app-content ${immersive ? "mobile-app-content--immersive" : ""}`}>
          {children}
        </div>
        {!immersive && <MobileTabBar />}
      </div>
    </div>
  );
}
