import { Navigate } from "react-router-dom";

/** Legacy route — redirects to Trust Circle login/dashboard flow */
export default function CallVerification() {
  return <Navigate to="/call" replace />;
}
