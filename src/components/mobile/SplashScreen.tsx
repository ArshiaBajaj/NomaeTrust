export default function SplashScreen() {
  return (
    <div className="mobile-splash" role="status" aria-label="Loading NomaeTrust">
      <div className="mobile-splash-icon" aria-hidden>
        <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16">
          <rect width="64" height="64" rx="16" fill="#0f172a" />
          <path
            d="M32 18c-8.837 0-16 7.163-16 16v4c0 8.837 7.163 16 16 16s16-7.163 16-16v-4c0-8.837-7.163-16-16-16z"
            fill="#1e3a5f"
            stroke="#4ade80"
            strokeWidth="2.5"
          />
          <path
            d="M24 36l6 6 12-14"
            stroke="#4ade80"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mobile-splash-title">NomaeTrust</h1>
      <p className="mobile-splash-tagline">Rumor → Reality → Action</p>
      <div className="mobile-splash-loader" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
