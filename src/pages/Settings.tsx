import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ActionSheet from "../components/mobile/ActionSheet";
import IOSAlert from "../components/mobile/IOSAlert";
import { useAppBoot } from "../context/AppBootContext";
import { useHaptic } from "../hooks/useHaptic";

type RowProps = {
  label: string;
  value?: string;
  chevron?: boolean;
  to?: string;
  onClick?: () => void;
};

function Row({ label, value, chevron, to, onClick }: RowProps) {
  const inner = (
    <>
      <span className="text-[16px] font-medium text-ink">{label}</span>
      <span className="flex items-center gap-1.5 text-[15px] text-muted">
        {value}
        {chevron && <span className="text-[18px] leading-none text-muted">›</span>}
      </span>
    </>
  );
  const cls = "nt-press flex w-full items-center justify-between px-4 py-[15px] text-left";
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {inner}
      </button>
    );
  }
  return <div className="flex w-full items-center justify-between px-4 py-[15px]">{inner}</div>;
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="nt-kicker px-4">{title}</h2>}
      <div className="nt-card divide-y divide-[var(--color-line)] overflow-hidden p-0">{children}</div>
    </section>
  );
}

export default function Settings() {
  const haptic = useHaptic();
  const { resetOnboarding } = useAppBoot();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetAlert, setResetAlert] = useState(false);

  return (
    <div className="nt-screen nt-stagger">
      <header className="flex items-center gap-4 pt-1">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white"
          style={{ background: "var(--grad-brand)", boxShadow: "var(--shadow-lift)" }}
          aria-hidden
        >
          F
        </div>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Fatima</h1>
          <p className="mt-0.5 text-[13px] text-muted">Atlanta, GA · English &amp; Somali</p>
        </div>
      </header>

      <Group title="Preferences">
        <Row
          label="Language"
          value="English"
          onClick={() => {
            haptic("light");
            setSheetOpen(true);
          }}
        />
        <Row label="Notifications" value="On" />
      </Group>

      <Group title="About">
        <Row label="Trust & disclosure" chevron to="/disclosure" onClick={() => haptic("light")} />
        <Row
          label="Replay onboarding"
          chevron
          onClick={() => {
            haptic("light");
            setResetAlert(true);
          }}
        />
      </Group>

      <Group>
        <Row label="Version" value="1.0 · Hackathon" />
      </Group>

      <p className="px-4 text-center text-[12px] leading-relaxed text-muted">
        Add NomaeTrust to your Home Screen for the full app experience — no App Store needed.
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
