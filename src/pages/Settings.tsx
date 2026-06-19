import { useState } from "react";
import { Link } from "react-router-dom";
import ActionSheet from "../components/mobile/ActionSheet";
import IOSAlert from "../components/mobile/IOSAlert";
import { useAppBoot } from "../context/AppBootContext";
import { useHaptic } from "../hooks/useHaptic";

export default function Settings() {
  const haptic = useHaptic();
  const { resetOnboarding } = useAppBoot();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetAlert, setResetAlert] = useState(false);

  return (
    <div className="mobile-screen">
      <header className="mobile-profile-header">
        <div className="mobile-profile-avatar" aria-hidden>
          F
        </div>
        <div>
          <h1 className="mobile-profile-name">Fatima</h1>
          <p className="mobile-profile-meta">Atlanta, GA · English & Somali</p>
        </div>
      </header>

      <section className="mobile-settings-group">
        <h2 className="mobile-section-label">Preferences</h2>
        <div className="mobile-settings-list">
          <button
            type="button"
            className="mobile-settings-row ios-btn"
            onClick={() => {
              haptic("light");
              setSheetOpen(true);
            }}
          >
            <span>Language</span>
            <span className="mobile-settings-value">English</span>
          </button>
          <div className="mobile-settings-row mobile-settings-row--static">
            <span>Notifications</span>
            <span className="mobile-settings-value">On</span>
          </div>
        </div>
      </section>

      <section className="mobile-settings-group">
        <h2 className="mobile-section-label">About</h2>
        <div className="mobile-settings-list">
          <Link to="/disclosure" className="mobile-settings-row ios-btn" onClick={() => haptic("light")}>
            <span>Trust & disclosure</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </Link>
          <button
            type="button"
            className="mobile-settings-row ios-btn"
            onClick={() => {
              haptic("light");
              setResetAlert(true);
            }}
          >
            <span>Replay onboarding</span>
            <span className="mobile-settings-chevron" aria-hidden>›</span>
          </button>
        </div>
      </section>

      <section className="mobile-settings-group">
        <div className="mobile-settings-list">
          <div className="mobile-settings-row mobile-settings-row--static">
            <span>Version</span>
            <span className="mobile-settings-value">1.0 · Hackathon</span>
          </div>
        </div>
      </section>

      <p className="mobile-settings-footnote">
        Add to Home Screen for the full app experience — no App Store needed.
      </p>

      <ActionSheet
        open={sheetOpen}
        title="Language"
        message="Demo build — multilingual Action Cards coming soon."
        options={[
          { label: "English", onSelect: () => {} },
          { label: "Somali", onSelect: () => {} },
          { label: "Spanish", onSelect: () => {} },
        ]}
        onClose={() => setSheetOpen(false)}
      />

      <IOSAlert
        open={resetAlert}
        title="Replay onboarding?"
        message="You'll see the welcome screens again next time you open the app."
        confirmLabel="Replay"
        cancelLabel="Cancel"
        onConfirm={() => {
          resetOnboarding();
          setResetAlert(false);
        }}
        onCancel={() => setResetAlert(false)}
      />
    </div>
  );
}
