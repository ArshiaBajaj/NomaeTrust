import { NavLink, useNavigate } from "react-router-dom";
import {
  INDIVIDUAL_TABS,
  PLATFORM_TABS,
  ROUTES,
  type TabItem,
} from "../../config/navigation";
import { useAudience } from "../../context/AudienceContext";
import {
  profileAvatarUrl,
  profileDisplayName,
  usePortalAuth,
} from "../../context/PortalAuthContext";
import { useHaptic } from "../../hooks/useHaptic";
import ProfileAvatar from "../auth/ProfileAvatar";

type TabIconName = string;

function TabIcon({ name }: { name: TabIconName }) {
  const p = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.85,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "home":
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.95-8.96a1.13 1.13 0 0 1 1.6 0L21.75 12M4.5 9.75v10.13c0 .62.5 1.12 1.13 1.12H9.75V15c0-.62.5-1.13 1.13-1.13h2.25c.62 0 1.12.51 1.12 1.13v6h4.13c.62 0 1.12-.5 1.12-1.13V9.75" />
        </svg>
      );
    case "verify":
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
    case "detective":
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
        </svg>
      );
    case "map":
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
        </svg>
      );
    case "queue":
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75v-.008z" />
        </svg>
      );
    default:
      return null;
  }
}

function scrollToQueue() {
  document.getElementById("platform-queue")?.scrollIntoView({ behavior: "smooth" });
}

function TabLink({
  tab,
  onOpenProfile,
}: {
  tab: TabItem;
  onOpenProfile: () => void;
}) {
  const haptic = useHaptic();
  const navigate = useNavigate();

  if (tab.action === "menu") {
    return (
      <button type="button" className="nt-tab" onClick={onOpenProfile}>
        <TabIcon name={tab.icon} />
        <span className="nt-tab-label">{tab.label}</span>
      </button>
    );
  }

  if (tab.action === "queue") {
    return (
      <button
        type="button"
        className="nt-tab"
        onClick={() => {
          haptic("light");
          if (window.location.pathname !== ROUTES.platform) {
            navigate(`${ROUTES.platform}#queue`);
            return;
          }
          scrollToQueue();
        }}
      >
        <TabIcon name={tab.icon} />
        <span className="nt-tab-label">{tab.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={tab.to ?? ROUTES.landing}
      end={tab.end}
      onClick={() => haptic("light")}
      className={({ isActive }) => `nt-tab ${isActive ? "nt-tab--active" : ""}`}
    >
      <TabIcon name={tab.icon} />
      <span className="nt-tab-label">{tab.label}</span>
    </NavLink>
  );
}

export default function MobileTabBar({ onOpenProfile }: { onOpenProfile: () => void }) {
  const haptic = useHaptic();
  const { audience } = useAudience();
  const { individual, platform } = usePortalAuth();
  const tabs = audience === "platform" ? PLATFORM_TABS : INDIVIDUAL_TABS;
  const name = profileDisplayName(audience, { individual, platform });
  const avatar = profileAvatarUrl(audience, { individual, platform });
  const fabTo = audience === "platform" ? ROUTES.platform : ROUTES.newsWatch;

  return (
    <div className="nt-dock">
      <nav className="nt-tabbar" aria-label="Main navigation">
        {tabs.map((tab) =>
          tab.action === "menu" ? (
            <button
              key={tab.label}
              type="button"
              className="nt-tab"
              onClick={() => {
                haptic("light");
                onOpenProfile();
              }}
              aria-label="Open profile menu"
            >
              <ProfileAvatar name={name} avatarUrl={avatar} size="sm" />
              <span className="nt-tab-label">{tab.label}</span>
            </button>
          ) : (
            <TabLink key={`${tab.to}-${tab.label}`} tab={tab} onOpenProfile={onOpenProfile} />
          ),
        )}
      </nav>

      <NavLink
        to={fabTo}
        aria-label="Verify"
        onClick={() => haptic("medium")}
        className="nt-fab"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.04A11.96 11.96 0 0 1 3.6 6 12 12 0 0 0 3 9.75c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.31-.21-2.57-.6-3.75h-.15a11.96 11.96 0 0 1-8.25-3.29Z" />
        </svg>
      </NavLink>
    </div>
  );
}
