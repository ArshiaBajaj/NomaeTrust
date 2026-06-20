import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("nomae-install-dismissed") === "1");
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (isIos()) setIosHint(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || isStandalone() || (!deferred && !iosHint)) return null;

  const close = () => {
    localStorage.setItem("nomae-install-dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="mx-[18px] mt-3 flex items-center gap-3 rounded-[20px] p-3.5 nt-glass" style={{ boxShadow: "var(--shadow-soft)" }}>
      <span className="nt-tile nt-tile--lilac" style={{ width: 38, height: 38, fontSize: 18 }} aria-hidden>
        📲
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-snug text-ink">
          {deferred ? "Install NomaeTrust" : "Add to Home Screen"}
        </p>
        <p className="text-[11px] leading-snug text-muted">
          {deferred ? "Full-screen app, no App Store." : "Tap Share → Add to Home Screen."}
        </p>
      </div>
      {deferred ? (
        <button
          type="button"
          className="nt-press rounded-full bg-blue px-3.5 py-1.5 text-[12px] font-bold text-white"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install
        </button>
      ) : null}
      <button type="button" className="nt-press px-1 text-[12px] font-semibold text-muted" onClick={close}>
        ✕
      </button>
    </div>
  );
}
