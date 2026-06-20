export default function SplashScreen() {
  return (
    <div
      role="status"
      aria-label="Loading NomaeTrust"
      className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-5 overflow-hidden text-white"
      style={{ background: "var(--grad-brand)" }}
    >
      <span className="nt-blob" style={{ width: 260, height: 260, top: -40, left: -60, background: "#ffd36e" }} />
      <span className="nt-blob" style={{ width: 240, height: 240, bottom: -40, right: -50, background: "#8fe3c6" }} />

      <div
        className="flex h-24 w-24 items-center justify-center rounded-[30px]"
        style={{
          background: "rgba(255,255,255,0.18)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.45), 0 24px 48px -16px rgba(50,46,77,0.5)",
          animation: "nt-breathe 3s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12" stroke="#fff" strokeWidth={1.9}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.04A11.96 11.96 0 0 1 3.6 6 12 12 0 0 0 3 9.75c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.31-.21-2.57-.6-3.75h-.15a11.96 11.96 0 0 1-8.25-3.29Z"
          />
        </svg>
      </div>

      <div className="relative text-center">
        <h1 className="text-[30px] font-extrabold tracking-tight">NomaeTrust</h1>
        <p className="mt-1 text-sm font-medium tracking-wide text-white/85">Verify before you panic</p>
      </div>

      <div className="nt-dots relative text-white/90">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
