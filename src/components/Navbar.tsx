import { Link, NavLink, useLocation } from "react-router-dom";
import {
  homeForAudience,
  INDIVIDUAL_NAV,
  PLATFORM_NAV,
  ROUTES,
} from "../config/navigation";
import { useAudience } from "../context/AudienceContext";
import NomaeTrustLogo from "./NomaeTrustLogo";

export default function Navbar() {
  const { pathname } = useLocation();
  const { audience } = useAudience();
  const isHero = pathname === ROUTES.home;
  const navLinks = audience === "platform" ? PLATFORM_NAV : INDIVIDUAL_NAV;
  const homeTo = homeForAudience(audience);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${
        isHero
          ? "bg-transparent"
          : "border-b border-[rgba(15,23,42,0.06)] bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link to={homeTo} className="flex items-center">
          <NomaeTrustLogo size="md" onDark={isHero} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-normal transition-opacity duration-150 ${
                  isHero
                    ? isActive
                      ? "nav-link-active-hero"
                      : "text-white/75 hover:text-white"
                    : isActive
                      ? "nav-link-active"
                      : "text-text-muted hover:text-text"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to={ROUTES.settings}
            className={({ isActive }) =>
              `text-sm font-normal transition-opacity duration-150 ${
                isHero
                  ? isActive
                    ? "nav-link-active-hero"
                    : "text-white/75 hover:text-white"
                  : isActive
                    ? "nav-link-active"
                    : "text-text-muted hover:text-text"
              }`
            }
          >
            Settings
          </NavLink>
        </nav>

        {!isHero && (
          <Link
            to={audience === "platform" ? ROUTES.platform : ROUTES.newsWatch}
            className="btn-primary px-5 py-2 text-sm"
          >
            {audience === "platform" ? "Publish gate" : "Verify a claim"}
          </Link>
        )}

        {isHero && <div className="hidden w-[140px] md:block" aria-hidden />}
      </div>
    </header>
  );
}
