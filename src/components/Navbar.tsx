import { Link, NavLink, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/voice", label: "Voice" },
  { to: "/screenshot", label: "Screenshot" },
  { to: "/call", label: "Call" },
  { to: "/trust-map", label: "Trust Map" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isHero = pathname === "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${
        isHero
          ? "bg-transparent"
          : "border-b border-[rgba(15,23,42,0.06)] bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className={`flex items-center gap-2.5 ${
            isHero ? "text-white" : "text-text"
          }`}
        >
          <svg
            className={`h-5 w-5 ${isHero ? "text-white" : "text-accent"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <span className="text-base font-medium tracking-tight">NomaeTrust</span>
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
        </nav>

        {!isHero && (
          <Link to="/voice" className="btn-primary px-5 py-2 text-sm">
            Start verification
          </Link>
        )}

        {isHero && <div className="hidden w-[140px] md:block" aria-hidden />}
      </div>
    </header>
  );
}
