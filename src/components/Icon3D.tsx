/**
 * Clean, sharp, lightly-3D glyphs: solid white forms with a translucent inner
 * shade for depth. Designed to sit inside a `.nt-tile` (gloss + drop shadow
 * come from CSS). Replaces flat emoji across the app.
 */
import type { ReactElement } from "react";

const SHADE = "rgba(18,14,38,0.22)";

export type Icon3DName =
  | "mic"
  | "camera"
  | "search"
  | "eye"
  | "pin"
  | "shield"
  | "lock"
  | "scale"
  | "chip"
  | "book"
  | "flask"
  | "lifebuoy";

export default function Icon3D({ name, className }: { name: Icon3DName; className?: string }) {
  return (
    <svg className={`nt-glyph ${className ?? ""}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      {GLYPHS[name]}
    </svg>
  );
}

const GLYPHS: Record<Icon3DName, ReactElement> = {
  mic: (
    <>
      <rect x="9" y="2.4" width="6" height="11" rx="3" fill="#fff" />
      <path d="M6.5 10.8a5.5 5.5 0 0 0 11 0" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M12 16.4v3.4M9.2 20h5.6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      <rect x="10.4" y="4" width="1.6" height="6" rx="0.8" fill="#fff" opacity="0.5" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="6.6" width="18" height="13" rx="4" fill="#fff" />
      <path d="M8.5 6.6 9.6 4.7h4.8l1.1 1.9z" fill="#fff" />
      <circle cx="12" cy="13.1" r="3.5" fill={SHADE} />
      <circle cx="10.8" cy="11.9" r="1" fill="#fff" opacity="0.9" />
      <circle cx="17.4" cy="9.6" r="0.9" fill={SHADE} />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.4" fill="#fff" />
      <circle cx="10.8" cy="10.8" r="3.2" fill={SHADE} />
      <circle cx="9.2" cy="9.2" r="1" fill="#fff" opacity="0.85" />
      <path d="m15.8 15.8 4 4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12Z" fill="#fff" />
      <circle cx="12" cy="12" r="3.3" fill={SHADE} />
      <circle cx="10.8" cy="10.8" r="1.05" fill="#fff" />
    </>
  ),
  pin: (
    <>
      <path d="M12 2.4c-4.2 0-7.5 3.2-7.5 7.3 0 5 7.5 11.9 7.5 11.9s7.5-6.9 7.5-11.9c0-4.1-3.3-7.3-7.5-7.3Z" fill="#fff" />
      <circle cx="12" cy="9.7" r="2.8" fill={SHADE} />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.4 19 5v5.4c0 4.8-3 8.5-7 9.6-4-1.1-7-4.8-7-9.6V5z" fill="#fff" />
      <path d="m8.7 11.9 2.2 2.2 4.4-4.6" stroke={SHADE} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.2" width="15" height="11" rx="3.2" fill="#fff" />
      <path d="M7.8 10.2V8a4.2 4.2 0 0 1 8.4 0v2.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.9" fill={SHADE} />
      <rect x="11.2" y="15" width="1.6" height="3.4" rx="0.8" fill={SHADE} />
    </>
  ),
  scale: (
    <>
      <path d="M12 3.2v16.4M6 19.6h12" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.7" fill="#fff" />
      <path d="M4 7.5h16" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M4 7.5 1.8 12.5h4.4zM20 7.5l-2.2 5h4.4z" fill="#fff" />
    </>
  ),
  chip: (
    <>
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3" fill="#fff" />
      <rect x="9.4" y="9.4" width="5.2" height="5.2" rx="1.4" fill={SHADE} />
      <path d="M9 3.4v2.4M12 3.4v2.4M15 3.4v2.4M9 18.2v2.4M12 18.2v2.4M15 18.2v2.4M3.4 9h2.4M3.4 12h2.4M3.4 15h2.4M18.2 9h2.4M18.2 12h2.4M18.2 15h2.4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h8.5a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 1.2z" fill="#fff" />
      <path d="M19 4.5h-3a3 3 0 0 0-3 3V20h3a3 3 0 0 1 3 1.2z" fill="#fff" opacity="0.78" />
      <path d="M7.6 8.4h5M7.6 11.4h5" stroke={SHADE} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3.2v5.1L5.2 17a2.4 2.4 0 0 0 2.1 3.6h9.4a2.4 2.4 0 0 0 2.1-3.6L14 8.3V3.2z" fill="#fff" />
      <path d="M8.7 13.5h6.6" stroke={SHADE} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11" cy="16.3" r="1" fill={SHADE} />
      <path d="M9 3.2h6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="8.4" fill="#fff" />
      <circle cx="12" cy="12" r="3.4" fill={SHADE} />
      <path d="M12 3.6v3.4M12 17v3.4M3.6 12H7M17 12h3.4" stroke={SHADE} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};
