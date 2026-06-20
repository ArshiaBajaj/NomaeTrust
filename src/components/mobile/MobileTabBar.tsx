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
import ProfileAvatar from "../auth/ProfileAvatar";

function TabIcon({ name }: { name: string }) {
  const props = {
    className: "mobile-tab-svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "verify":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "detective":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
        </svg>
      );
    case "map":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      );
    case "queue":
      return (
        <svg {...props}>
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
  const navigate = useNavigate();

  if (tab.action === "menu") {
    return (
      <button type="button" className="mobile-tab ios-btn" onClick={onOpenProfile}>
        <TabIcon name={tab.icon} />
        <span className="mobile-tab-label">{tab.label}</span>
      </button>
    );
  }

  if (tab.action === "queue") {
    return (
      <button
        type="button"
        className="mobile-tab ios-btn"
        onClick={() => {
          if (window.location.pathname !== ROUTES.platform) {
            navigate(`${ROUTES.platform}#queue`);
            return;
          }
          scrollToQueue();
        }}
      >
        <TabIcon name={tab.icon} />
        <span className="mobile-tab-label">{tab.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={tab.to ?? ROUTES.landing}
      end={tab.end}
      className={({ isActive }) =>
        `mobile-tab ios-btn ${isActive ? "mobile-tab--active" : ""}`
      }
    >
      <TabIcon name={tab.icon} />
      <span className="mobile-tab-label">{tab.label}</span>
    </NavLink>
  );
}

export default function MobileTabBar({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { audience } = useAudience();
  const { individual, platform } = usePortalAuth();
  const tabs = audience === "platform" ? PLATFORM_TABS : INDIVIDUAL_TABS;
  const name = profileDisplayName(audience, { individual, platform });
  const avatar = profileAvatarUrl(audience, { individual, platform });

  return (
    <nav
      className="mobile-tab-bar"
      aria-label="Main navigation"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
    >
      {tabs.map((tab) =>
        tab.action === "menu" ? (
          <button
            key={tab.label}
            type="button"
            className="mobile-tab ios-btn"
            onClick={onOpenProfile}
            aria-label="Open profile menu"
          >
            <ProfileAvatar name={name} avatarUrl={avatar} size="sm" />
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        ) : (
          <TabLink key={`${tab.to}-${tab.label}`} tab={tab} onOpenProfile={onOpenProfile} />
        ),
      )}
    </nav>
  );
}
