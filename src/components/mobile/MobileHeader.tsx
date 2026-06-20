import { Link, useLocation, useNavigate } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/stress": "Verify a voice note",
  "/screenshot": "Verify a screenshot",
  "/call": "Context Trace",
  "/context-trace": "Context Trace",
  "/trust-map": "Confusion Map",
  "/settings": "Profile",
  "/disclosure": "Responsible AI",
};

const TAB_ROOTS = new Set(["/stress", "/trust-map", "/settings"]);

export default function MobileHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = TITLES[pathname] ?? "NomaeTrust";
  const showBack = !TAB_ROOTS.has(pathname);

  return (
    <header className="nt-topbar">
      {showBack ? (
        <button
          type="button"
          className="nt-topbar-btn nt-press"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      ) : (
        <span className="nt-topbar-btn" aria-hidden style={{ background: "var(--grad-blue)", color: "#fff" }}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.04A11.96 11.96 0 0 1 3.6 6 12 12 0 0 0 3 9.75c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.31-.21-2.57-.6-3.75h-.15a11.96 11.96 0 0 1-8.25-3.29Z" />
          </svg>
        </span>
      )}

      <h1 className="nt-topbar-title">{title}</h1>

      {pathname === "/settings" ? (
        <span className="nt-topbar-btn" aria-hidden style={{ opacity: 0 }} />
      ) : (
        <Link to="/settings" className="nt-topbar-btn nt-press" aria-label="Profile">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.12a7.5 7.5 0 0 1 15 0" />
          </svg>
        </Link>
      )}
    </header>
  );
}
