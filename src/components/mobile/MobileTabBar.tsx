import { NavLink } from "react-router-dom";
import { useHaptic } from "../../hooks/useHaptic";

type TabName = "home" | "detective" | "map" | "profile";

function TabIcon({ name }: { name: TabName }) {
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
    case "profile":
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.12a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
  }
}

const TABS: { to: string; label: string; icon: TabName }[] = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/detective", label: "Detective", icon: "detective" },
  { to: "/trust-map", label: "Map", icon: "map" },
  { to: "/settings", label: "Profile", icon: "profile" },
];

export default function MobileTabBar() {
  const haptic = useHaptic();
  return (
    <div className="nt-dock">
      <nav className="nt-tabbar" aria-label="Main navigation">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            onClick={() => haptic("light")}
            className={({ isActive }) => `nt-tab ${isActive ? "nt-tab--active" : ""}`}
          >
            <TabIcon name={tab.icon} />
            <span className="nt-tab-label">{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/stress"
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
