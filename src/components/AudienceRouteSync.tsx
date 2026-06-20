import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { audienceForPath } from "../config/navigation";
import { useAudience } from "../context/AudienceContext";

/** Keeps audience context aligned with the current portal route. */
export default function AudienceRouteSync() {
  const { pathname } = useLocation();
  const { audience, setAudience } = useAudience();

  useEffect(() => {
    const expected = audienceForPath(pathname);
    if (expected && expected !== audience) {
      setAudience(expected);
    }
  }, [pathname, audience, setAudience]);

  return null;
}
