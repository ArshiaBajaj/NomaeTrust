import { Link } from "react-router-dom";
import Icon3D from "../components/Icon3D";
import NomaeTrustLogo from "../components/NomaeTrustLogo";
import { ROUTES } from "../config/navigation";
import { useHaptic } from "../hooks/useHaptic";
import { useIsMobile } from "../hooks/useIsMobile";

export default function AudienceChooser() {
  const haptic = useHaptic();
  const isMobile = useIsMobile();

  const content = (
    <>
      <header className="text-center">
        <div className="mb-2 flex justify-center">
          <NomaeTrustLogo size="md" />
        </div>
        <h1 className="nt-h1 mt-1">Switch portal</h1>
        <p className="nt-h1-sub mx-auto max-w-sm">
          Sign in again to switch between individual and company experiences.
        </p>
      </header>

      <div className="grid gap-3">
        <Link
          to={ROUTES.loginIndividual}
          className="nt-card nt-press flex items-center gap-4 p-5"
          onClick={() => haptic("light")}
        >
          <span className="nt-tile nt-tile--blue" style={{ width: 52, height: 52 }} aria-hidden>
            <Icon3D name="shield" />
          </span>
          <span>
            <h2 className="text-[17px] font-bold text-ink">Individuals & families</h2>
            <p className="text-[13px] text-muted">Verify major claims and headlines.</p>
          </span>
        </Link>

        <Link
          to={ROUTES.loginPlatform}
          className="nt-card nt-press flex items-center gap-4 p-5"
          onClick={() => haptic("light")}
        >
          <span className="nt-tile nt-tile--lilac" style={{ width: 52, height: 52 }} aria-hidden>
            <Icon3D name="chip" />
          </span>
          <span>
            <h2 className="text-[17px] font-bold text-ink">Platforms & publishers</h2>
            <p className="text-[13px] text-muted">Access the publish gate.</p>
          </span>
        </Link>
      </div>
    </>
  );

  if (isMobile) {
    return <div className="nt-screen nt-stagger">{content}</div>;
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-lg px-6 pb-20 pt-16">{content}</div>
    </div>
  );
}
