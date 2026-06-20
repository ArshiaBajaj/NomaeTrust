import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getClaimById } from "../services/map";
import type { Claim, EvidenceCard } from "../types";
import { evidenceCardFromClaim } from "../utils/claimToEvidenceCard";

export function useMapClaimDeepLink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [card, setCard] = useState<EvidenceCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapClaimId = searchParams.get("mapClaimId");

  useEffect(() => {
    if (!mapClaimId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getClaimById(mapClaimId)
      .then((loaded) => {
        if (cancelled) return;
        setClaim(loaded);
        setCard(evidenceCardFromClaim(loaded));
        setSearchParams({}, { replace: true });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load claim.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mapClaimId, setSearchParams]);

  return { claim, card, loading: Boolean(mapClaimId) && loading, error, mapClaimId };
}
