import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AudienceMode } from "./AudienceContext";
import { useAudience } from "./AudienceContext";

export type IndividualProfile = {
  displayName: string;
  city: string;
  language: string;
  avatarUrl?: string;
};

export type PlatformProfile = {
  orgName: string;
  teamName: string;
  workEmail: string;
  role: string;
  avatarUrl?: string;
};

const INDIVIDUAL_KEY = "nomae-individual-session";
const PLATFORM_KEY = "nomae-platform-session";

function readIndividual(): IndividualProfile | null {
  try {
    const raw = localStorage.getItem(INDIVIDUAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IndividualProfile;
  } catch {
    return null;
  }
}

function readPlatform(): PlatformProfile | null {
  try {
    const raw = localStorage.getItem(PLATFORM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlatformProfile;
  } catch {
    return null;
  }
}

type PortalAuthContextValue = {
  individual: IndividualProfile | null;
  platform: PlatformProfile | null;
  isAuthenticated: boolean;
  loginIndividual: (profile: IndividualProfile) => void;
  loginPlatform: (profile: PlatformProfile) => void;
  updateIndividual: (patch: Partial<IndividualProfile>) => void;
  updatePlatform: (patch: Partial<PlatformProfile>) => void;
  logout: () => void;
};

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const { audience, setAudience, clearAudience } = useAudience();
  const [individual, setIndividual] = useState<IndividualProfile | null>(readIndividual);
  const [platform, setPlatform] = useState<PlatformProfile | null>(readPlatform);

  // Restore audience from saved session on refresh
  useEffect(() => {
    if (audience) return;
    if (individual) {
      setAudience("individual");
    } else if (platform) {
      setAudience("platform");
    }
  }, [audience, individual, platform, setAudience]);

  const isAuthenticated = Boolean(individual || platform);

  const loginIndividual = useCallback(
    (profile: IndividualProfile) => {
      const merged = { ...readIndividual(), ...profile };
      localStorage.setItem(INDIVIDUAL_KEY, JSON.stringify(merged));
      setIndividual(merged);
      setAudience("individual");
    },
    [setAudience],
  );

  const loginPlatform = useCallback(
    (profile: PlatformProfile) => {
      const merged = { ...readPlatform(), ...profile };
      localStorage.setItem(PLATFORM_KEY, JSON.stringify(merged));
      setPlatform(merged);
      setAudience("platform");
    },
    [setAudience],
  );

  const updateIndividual = useCallback((patch: Partial<IndividualProfile>) => {
    setIndividual((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(INDIVIDUAL_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updatePlatform = useCallback((patch: Partial<PlatformProfile>) => {
    setPlatform((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(PLATFORM_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(INDIVIDUAL_KEY);
    localStorage.removeItem(PLATFORM_KEY);
    setIndividual(null);
    setPlatform(null);
    clearAudience();
  }, [clearAudience]);

  const value = useMemo(
    () => ({
      individual,
      platform,
      isAuthenticated,
      loginIndividual,
      loginPlatform,
      updateIndividual,
      updatePlatform,
      logout,
    }),
    [
      individual,
      platform,
      isAuthenticated,
      loginIndividual,
      loginPlatform,
      updateIndividual,
      updatePlatform,
      logout,
    ],
  );

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used within PortalAuthProvider");
  return ctx;
}

export function activeProfile(
  audience: AudienceMode | null,
  auth: Pick<PortalAuthContextValue, "individual" | "platform">,
): IndividualProfile | PlatformProfile | null {
  if (audience === "platform") return auth.platform;
  if (audience === "individual") return auth.individual;
  return auth.individual ?? auth.platform;
}

export function profileDisplayName(
  audience: AudienceMode | null,
  auth: Pick<PortalAuthContextValue, "individual" | "platform">,
): string {
  if (audience === "platform") return auth.platform?.orgName ?? "Platform";
  return auth.individual?.displayName ?? auth.platform?.orgName ?? "Guest";
}

export function profileAvatarUrl(
  audience: AudienceMode | null,
  auth: Pick<PortalAuthContextValue, "individual" | "platform">,
): string | undefined {
  if (audience === "platform") return auth.platform?.avatarUrl;
  return auth.individual?.avatarUrl ?? auth.platform?.avatarUrl;
}
