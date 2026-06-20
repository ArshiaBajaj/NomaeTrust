import { Navigate } from "react-router-dom";
import { homeForAudience, ROUTES } from "../config/navigation";
import { useAudience } from "../context/AudienceContext";
import { usePortalAuth } from "../context/PortalAuthContext";
import LandingPage from "./LandingPage";

/** Root entry: landing for new visitors, redirect for signed-in users. */
export default function EntryGate() {
  const { audience } = useAudience();
  const { isAuthenticated, individual, platform } = usePortalAuth();

  if (individual && audience !== "platform") {
    return <Navigate to={ROUTES.individual} replace />;
  }
  if (platform && !individual) {
    return <Navigate to={ROUTES.platform} replace />;
  }
  if (isAuthenticated && audience) {
    return <Navigate to={homeForAudience(audience)} replace />;
  }

  return <LandingPage />;
}
