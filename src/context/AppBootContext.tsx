import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIsMobile } from "../hooks/useIsMobile";

const ONBOARDING_KEY = "nomae-onboarding-v1";

export type BootPhase = "splash" | "onboarding" | "ready";

type AppBootContextValue = {
  phase: BootPhase;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const AppBootContext = createContext<AppBootContextValue | null>(null);

export function AppBootProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<BootPhase>("splash");

  useEffect(() => {
    if (!isMobile) {
      setPhase("ready");
      return;
    }

    const timer = window.setTimeout(() => {
      const done = localStorage.getItem(ONBOARDING_KEY) === "1";
      setPhase(done ? "ready" : "onboarding");
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [isMobile]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setPhase("ready");
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setPhase("onboarding");
  }, []);

  const value = useMemo(
    () => ({ phase, completeOnboarding, resetOnboarding }),
    [phase, completeOnboarding, resetOnboarding],
  );

  return <AppBootContext.Provider value={value}>{children}</AppBootContext.Provider>;
}

export function useAppBoot(): AppBootContextValue {
  const ctx = useContext(AppBootContext);
  if (!ctx) {
    throw new Error("useAppBoot must be used within AppBootProvider");
  }
  return ctx;
}
