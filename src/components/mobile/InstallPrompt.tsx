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
    Boolean(
      "standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone,
    )
  );
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("nomae-install-dismissed") === "1",
  );
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIos()) {
      setShowIosHint(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || isStandalone()) return null;

  if (showIosHint && !deferred) {
    return (
      <div className="mobile-install-banner">
        <p className="mobile-install-text">
          Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install NomaeTrust
        </p>
        <button
          type="button"
          className="mobile-install-dismiss"
          onClick={() => {
            localStorage.setItem("nomae-install-dismissed", "1");
            setDismissed(true);
          }}
        >
          Got it
        </button>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="mobile-install-banner">
      <p className="mobile-install-text">Install NomaeTrust for the full mobile experience</p>
      <div className="mobile-install-actions">
        <button
          type="button"
          className="mobile-install-btn"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install
        </button>
        <button
          type="button"
          className="mobile-install-dismiss"
          onClick={() => {
            localStorage.setItem("nomae-install-dismissed", "1");
            setDismissed(true);
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
