import NomaeTrustLogo from "../NomaeTrustLogo";

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

      <NomaeTrustLogo size="lg" onDark />

      <p className="relative text-sm font-medium tracking-wide text-white/85">Verify before you panic</p>

      <div className="nt-dots relative text-white/90">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
