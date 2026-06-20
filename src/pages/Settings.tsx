import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/auth/ProfileAvatar";
import ActionSheet from "../components/mobile/ActionSheet";
import IOSAlert from "../components/mobile/IOSAlert";
import NewsShareSetup from "../components/newsWatch/NewsShareSetup";
import { ROUTES } from "../config/navigation";
import { useAppBoot } from "../context/AppBootContext";
import { useAudience } from "../context/AudienceContext";
import {
  profileAvatarUrl,
  profileDisplayName,
  usePortalAuth,
} from "../context/PortalAuthContext";
import { useHaptic } from "../hooks/useHaptic";
import {
  isAutoVerifyShareEnabled,
  setAutoVerifyShare,
} from "../utils/shareTarget";

type RowProps = {
  label: string;
  value?: string;
  chevron?: boolean;
  to?: string;
  onClick?: () => void;
  children?: ReactNode;
};

function Row({ label, value, chevron, to, onClick, children }: RowProps) {
  if (children) {
    return <div className="flex w-full items-center justify-between px-4 py-[15px]">{children}</div>;
  }
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
  const navigate = useNavigate();
  const { resetOnboarding } = useAppBoot();
  const { audience } = useAudience();
  const { individual, platform, updateIndividual, updatePlatform, logout } = usePortalAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resetAlert, setResetAlert] = useState(false);
  const [logoutAlert, setLogoutAlert] = useState(false);
  const [autoVerifyShare, setAutoVerifyShareState] = useState(isAutoVerifyShareEnabled);

  const profileName = profileDisplayName(audience, { individual, platform });
  const profileMeta =
    audience === "platform"
      ? `${platform?.teamName ?? "Team"} · ${platform?.role ?? "Moderator"}`
      : `${individual?.city ?? "Atlanta, GA"} · ${individual?.language ?? "English"}`;
  const avatar = profileAvatarUrl(audience, { individual, platform });

  const handlePhoto = (dataUrl: string) => {
    haptic("light");
    if (audience === "platform" && platform) {
      updatePlatform({ avatarUrl: dataUrl });
    } else if (individual) {
      updateIndividual({ avatarUrl: dataUrl });
    }
  };

  const handleLogout = () => {
    haptic("light");
    logout();
    navigate(ROUTES.landing, { replace: true });
  };

  return (
    <div className="nt-screen nt-stagger">
      <header className="flex items-center gap-4 pt-1">
        <ProfileAvatar
          name={profileName}
          avatarUrl={avatar}
          size="lg"
          editable
          onPhotoSelect={handlePhoto}
        />
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-ink">{profileName}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{profileMeta}</p>
        </div>
      </header>

      <Group title="Experience">
        <Row
          label="Individuals — major claims"
          value={audience === "individual" ? "Active" : undefined}
          to={ROUTES.loginIndividual}
          onClick={() => haptic("light")}
        />
        <Row
          label="Platforms — publish gate"
          value={audience === "platform" ? "Active" : undefined}
          to={ROUTES.loginPlatform}
          onClick={() => haptic("light")}
        />
        <Row
          label="Switch portal"
          chevron
          onClick={() => {
            haptic("light");
            navigate(ROUTES.choose);
          }}
        />
        <Row
          label="Sign out"
          chevron
          onClick={() => {
            haptic("light");
            setLogoutAlert(true);
          }}
        />
      </Group>

      <Group title="News verification">
        <Row label="Auto-verify shared stories">
          <label className="flex w-full cursor-pointer items-center justify-between">
            <span className="text-[16px] font-medium text-ink">Auto-verify shared stories</span>
            <input
              type="checkbox"
              checked={autoVerifyShare}
              onChange={(e) => {
                const on = e.target.checked;
                setAutoVerifyShare(on);
                setAutoVerifyShareState(on);
                haptic("light");
              }}
            />
          </label>
        </Row>
        <Row
          label="Set up Share → NomaeTrust"
          chevron
          to={ROUTES.newsWatch}
          onClick={() => haptic("light")}
        />
      </Group>
      <div className="px-4">
        <NewsShareSetup compact />
      </div>

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
        <Row label="Trust & disclosure" chevron to={ROUTES.disclosure} onClick={() => haptic("light")} />
        <Row label="Trust Circle (family)" chevron to={ROUTES.trustCircle} onClick={() => haptic("light")} />
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
        open={logoutAlert}
        title="Sign out?"
        message="You'll return to the landing page. Your profile on this device will be cleared."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setLogoutAlert(false);
          handleLogout();
        }}
        onCancel={() => setLogoutAlert(false)}
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
