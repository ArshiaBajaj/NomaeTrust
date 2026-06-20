import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../config/navigation";
import { usePortalLayout } from "../../hooks/usePortalLayout";

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
  const { isMobile, shell, content } = usePortalLayout();

  return (
    <div className={`${shell} portal-login-bg portal-login-bg--${accent}`}>
      <div className={`mx-auto max-w-md ${content} ${isMobile ? "pt-8" : "pt-16"}`}>
        <Link to={ROUTES.landing} className="portal-login-back">
          ← Back
        </Link>

        <header className="portal-login-header">
          <p className={`portal-login-eyebrow portal-login-eyebrow--${accent}`}>{eyebrow}</p>
          <h1 className="portal-login-title">{title}</h1>
          <p className="portal-login-desc">{description}</p>
        </header>

        <div className="portal-login-card">{children}</div>
      </div>
    </div>
  );
}
