import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AudienceMode = "individual" | "platform";

const STORAGE_KEY = "nomae-audience-mode";

type AudienceContextValue = {
  audience: AudienceMode | null;
  hasChosenAudience: boolean;
  setAudience: (mode: AudienceMode) => void;
  clearAudience: () => void;
};

const AudienceContext = createContext<AudienceContextValue | null>(null);

function readStoredAudience(): AudienceMode | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "individual" || stored === "platform") return stored;
  return null;
}

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudienceState] = useState<AudienceMode | null>(readStoredAudience);

  const setAudience = useCallback((mode: AudienceMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setAudienceState(mode);
  }, []);

  const clearAudience = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAudienceState(null);
  }, []);

  const value = useMemo(
    () => ({
      audience,
      hasChosenAudience: audience !== null,
      setAudience,
      clearAudience,
    }),
    [audience, setAudience, clearAudience],
  );

  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudience() {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error("useAudience must be used within AudienceProvider");
  return ctx;
}
