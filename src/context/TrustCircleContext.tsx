import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { TrustCircleMe } from "../types/trustCircle";
import {
  clearStoredSessionToken,
  createTrustCircle,
  fetchTrustCircleMe,
  getStoredSessionToken,
  joinTrustCircle,
  leaveTrustCircle,
} from "../services/trustCircleApi";

type TrustCircleContextValue = {
  me: TrustCircleMe | null;
  loading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  refresh: () => Promise<void>;
  createFamily: (familyName: string, displayName: string) => Promise<void>;
  joinFamily: (inviteCode: string, displayName: string) => Promise<void>;
  leave: () => Promise<void>;
};

const TrustCircleContext = createContext<TrustCircleContextValue | null>(null);

export function TrustCircleProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<TrustCircleMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(
    getStoredSessionToken(),
  );

  const refresh = useCallback(async () => {
    const token = getStoredSessionToken();
    setSessionToken(token);
    if (!token) {
      setMe(null);
      return;
    }
    const data = await fetchTrustCircleMe(token);
    setMe(data);
    if (!data) setSessionToken(null);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (!me) return;
    const id = setInterval(() => {
      refresh().catch(() => undefined);
    }, 1000);
    return () => clearInterval(id);
  }, [me, refresh]);

  const createFamily = useCallback(async (familyName: string, displayName: string) => {
    const data = await createTrustCircle(familyName, displayName);
    setSessionToken(data.sessionToken);
    setMe(data);
  }, []);

  const joinFamily = useCallback(async (inviteCode: string, displayName: string) => {
    const data = await joinTrustCircle(inviteCode, displayName);
    setSessionToken(data.sessionToken);
    setMe(data);
  }, []);

  const leave = useCallback(async () => {
    await leaveTrustCircle();
    clearStoredSessionToken();
    setSessionToken(null);
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({
      me,
      loading,
      isAuthenticated: Boolean(me && sessionToken),
      sessionToken,
      refresh,
      createFamily,
      joinFamily,
      leave,
    }),
    [me, loading, sessionToken, refresh, createFamily, joinFamily, leave],
  );

  return (
    <TrustCircleContext.Provider value={value}>{children}</TrustCircleContext.Provider>
  );
}

export function useTrustCircle(): TrustCircleContextValue {
  const ctx = useContext(TrustCircleContext);
  if (!ctx) {
    throw new Error("useTrustCircle must be used within TrustCircleProvider");
  }
  return ctx;
}
