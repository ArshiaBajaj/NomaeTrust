import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/stress", label: "Action Cards" },
  { to: "/screenshot", label: "Screenshots" },
  { to: "/context-lens", label: "ContextLens" },
  { to: "/call", label: "Trust Circle" },
  { to: "/trust-map", label: "Confusion Map" },
  { to: "/disclosure", label: "Disclosure" },
];

export default function Footer() {
  return (
    <footer className="footer-dark px-6 py-12 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm">
          <span className="font-medium text-white">NomaeTrust</span>
          <span className="text-[#6b7280]">
            {" "}
            &copy; {new Date().getFullYear()}
          </span>
        </p>
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
