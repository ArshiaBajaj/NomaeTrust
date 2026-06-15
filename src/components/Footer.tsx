import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} NomaeTrust. Built for a safer
          information ecosystem.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            to="/voice"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Voice
          </Link>
          <Link
            to="/screenshot"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Screenshot
          </Link>
          <Link
            to="/call"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Call
          </Link>
          <Link
            to="/trust-map"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Trust Map
          </Link>
        </div>
      </div>
    </footer>
  );
}
