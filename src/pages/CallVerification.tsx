import { Navigate } from "react-router-dom";

/** Legacy route — redirects to Context Trace */
export default function CallVerification() {
  return <Navigate to="/call" replace />;
}
