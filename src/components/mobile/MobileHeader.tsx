import { Link, useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "NomaeTrust",
  "/detective": "Digital Detective",
  "/stress": "Action Cards",
  "/screenshot": "Screenshots",
  "/call": "Context Trace",
  "/context-trace": "Context Trace",
  "/trust-map": "Confusion Map",
  "/disclosure": "Disclosure",
  "/voice": "Voice Verify",
};

export default function MobileHeader() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "NomaeTrust";

  return (
    <header className="mobile-header">
      <Link to="/" className="mobile-header-logo" aria-label="NomaeTrust home">
        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </Link>
      <h1 className="mobile-header-title">{title}</h1>
      <Link to="/disclosure" className="mobile-header-action" aria-label="About">
        ⓘ
      </Link>
    </header>
  );
}
