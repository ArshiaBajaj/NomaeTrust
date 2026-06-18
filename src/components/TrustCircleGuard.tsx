import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTrustCircle } from "../context/TrustCircleContext";
import TrustCircleDashboard from "../pages/TrustCircleDashboard";

export default function TrustCircleGuard() {
  const { isAuthenticated, loading } = useTrustCircle();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading Trust Circle…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/trust-circle/login" state={{ from: location }} replace />;
  }

  return <TrustCircleDashboard />;
}
