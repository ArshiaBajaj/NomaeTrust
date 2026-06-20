import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../config/navigation";
import { usePortalAuth } from "../../context/PortalAuthContext";

export function IndividualGuard({ children }: { children: ReactNode }) {
  const { individual } = usePortalAuth();
  if (!individual) {
    return <Navigate to={ROUTES.loginIndividual} replace />;
  }
  return <>{children}</>;
}

export function PlatformGuard({ children }: { children: ReactNode }) {
  const { platform } = usePortalAuth();
  if (!platform) {
    return <Navigate to={ROUTES.loginPlatform} replace />;
  }
  return <>{children}</>;
}

/** Any signed-in user (individual or platform) may access shared tools. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePortalAuth();
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.landing} replace />;
  }
  return <>{children}</>;
}
