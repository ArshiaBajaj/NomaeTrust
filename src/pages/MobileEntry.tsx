import { useIsMobile } from "../hooks/useIsMobile";
import Home from "./Home";
import MobileHome from "./MobileHome";

/** Mobile lands on app home hub; desktop shows marketing page. */
export default function MobileEntry() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileHome />;
  return <Home />;
}
