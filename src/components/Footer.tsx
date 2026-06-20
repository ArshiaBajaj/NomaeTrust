import { Link } from "react-router-dom";
import {
  INDIVIDUAL_FOOTER,
  PLATFORM_FOOTER,
  ROUTES,
} from "../config/navigation";
import { useAudience } from "../context/AudienceContext";
import NomaeTrustLogo from "./NomaeTrustLogo";

export default function Footer() {
  const { audience } = useAudience();
  const footerLinks = audience === "platform" ? PLATFORM_FOOTER : INDIVIDUAL_FOOTER;

  return (
    <footer className="footer-dark px-6 py-12 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.landing} aria-label="NomaeTrust home">
            <NomaeTrustLogo size="sm" onDark />
          </Link>
          <span className="text-sm text-[#6b7280]">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-[#9ca3af] transition-colors duration-150 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
