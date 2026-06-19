import { Navigate } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import Home from "./Home";

/** On mobile, land on Digital Detective first — feels like opening a game app. */
export default function MobileEntry() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <Navigate to="/detective" replace />;
  }
  return <Home />;
}
