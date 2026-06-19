import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

type MobilePageTransitionProps = {
  children: ReactNode;
};

export default function MobilePageTransition({ children }: MobilePageTransitionProps) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="mobile-page-transition">
      {children}
    </div>
  );
}
