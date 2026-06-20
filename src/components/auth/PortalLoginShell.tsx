import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../config/navigation";
import { useIsMobile } from "../../hooks/useIsMobile";
import NomaeTrustLogo from "../NomaeTrustLogo";

type PortalLoginShellProps = {
  accent: "individual" | "platform";
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function PortalLoginShell({
  accent,
  eyebrow,
  title,
  description,
  children,
}: PortalLoginShellProps) {
  const isMobile = useIsMobile();
  const grad =
    accent === "platform"
      ? "linear-gradient(160deg, #b9a8f2 0%, #9f9bf4 40%, #8fa6f6 100%)"
      : "linear-gradient(160deg, #8fa6f6 0%, #9f9bf4 35%, #ff9db8 100%)";

  const inner = (
    <>
      <Link
        to={ROUTES.landing}
        className="nt-press inline-flex items-center gap-1 text-[14px] font-semibold text-white/90"
      >
        ← Back
      </Link>

      <header className="mt-6 text-center">
        <div className="mb-4 flex justify-center">
          <NomaeTrustLogo size="md" onDark />
        </div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">{eyebrow}</p>
        <h1 className="mt-2 text-[28px] font-black tracking-tight text-white">{title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-white/85">{description}</p>
      </header>

      <div className="nt-card mt-8 p-5 shadow-[var(--shadow-soft)]">{children}</div>
    </>
  );

  if (!isMobile) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-md px-6 pb-20 pt-16">
          <div className="overflow-hidden rounded-[32px] p-6" style={{ background: grad }}>
            {inner}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-screen" style={{ background: grad, minHeight: "100dvh" }}>
      {inner}
    </div>
  );
}
