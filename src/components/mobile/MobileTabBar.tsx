import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/detective", label: "Detective", icon: "🕵️" },
  { to: "/stress", label: "Verify", icon: "✓" },
  { to: "/trust-map", label: "Map", icon: "📍" },
  { to: "/call", label: "Trace", icon: "🔍" },
] as const;

export default function MobileTabBar() {
  return (
    <nav className="mobile-tab-bar" aria-label="Main navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `mobile-tab ${isActive ? "mobile-tab--active" : ""}`
          }
        >
          <span className="mobile-tab-icon" aria-hidden>
            {tab.icon}
          </span>
          <span className="mobile-tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
