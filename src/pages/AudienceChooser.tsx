import { Link } from "react-router-dom";
import { ROUTES } from "../config/navigation";
import { usePortalLayout } from "../hooks/usePortalLayout";

export default function AudienceChooser() {
  const { isMobile, shell, content } = usePortalLayout();

  return (
    <div className={shell}>
      <div className={`mx-auto max-w-3xl ${content} ${isMobile ? "pt-10" : "pt-16"}`}>
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">NomaeTrust</p>
          <h1 className={`mt-3 font-serif ${isMobile ? "text-3xl" : "text-5xl"} text-text`}>
            Switch portal
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
            Sign in again to switch between individual and company experiences.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to={ROUTES.loginIndividual}
            className="audience-card audience-card--individual text-left"
          >
            <span className="audience-card-icon" aria-hidden>👤</span>
            <h2 className="audience-card-title">Individuals & families</h2>
            <p className="audience-card-desc">Sign in to verify major claims and headlines.</p>
            <span className="audience-card-cta">Individual sign-in →</span>
          </Link>

          <Link
            to={ROUTES.loginPlatform}
            className="audience-card audience-card--platform text-left"
          >
            <span className="audience-card-icon" aria-hidden>🏢</span>
            <h2 className="audience-card-title">Platforms & publishers</h2>
            <p className="audience-card-desc">Sign in to access the publish gate.</p>
            <span className="audience-card-cta">Company sign-in →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
