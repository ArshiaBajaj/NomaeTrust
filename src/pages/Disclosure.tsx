import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon3D, { type Icon3DName } from "../components/Icon3D";

const MODELS = [
  { name: "OpenAI Whisper", tier: "Transcription", cost: "Free tier" },
  { name: "GPT-4o-mini", tier: "Claims · OCR · evidence", cost: "Paid API" },
  { name: "Leaflet + OpenStreetMap", tier: "Confusion Map", cost: "Free" },
  { name: "Local voice passports", tier: "On-device storage", cost: "Free" },
];

const SOURCES = [
  { name: "Atlanta Community Food Bank", url: "https://www.acfb.org" },
  { name: "Georgia DPH", url: "https://dph.georgia.gov" },
  { name: "City of Atlanta", url: "https://www.atlantaga.gov" },
  { name: "Fulton County Government", url: "https://www.fultoncountyga.gov" },
  { name: "GEMA", url: "https://gema.georgia.gov" },
  { name: "United Way of Greater Atlanta", url: "https://www.unitedwayatlanta.org" },
];

const PRIVACY = [
  "Voice passports stored on-device (localStorage demo).",
  "Audio processed ephemerally — not persisted after analysis.",
  "Confusion Map keeps anonymized, neighborhood-level metadata — one pin per rumor.",
  "Trust Circle uses demo session tokens, not production auth.",
  "Context Trace compares original vs. viral context — never a binary fake/true verdict.",
];

const FAILURES = [
  "Low confidence → recommend human review or calling back a known number.",
  "Validator authentication + rate limits on fast-lane badges.",
  "Community opt-out for map pin aggregation (planned).",
];

function Card({ tone = "blue", icon, title, children }: { tone?: string; icon: Icon3DName; title: string; children: ReactNode }) {
  return (
    <section className="nt-card p-5">
      <div className="flex items-center gap-3">
        <span className={`nt-tile nt-tile--${tone}`} style={{ width: 42, height: 42 }} aria-hidden>
          <Icon3D name={icon} />
        </span>
        <h2 className="text-[16px] font-bold text-ink">{title}</h2>
      </div>
      <div className="mt-3 text-[13.5px] leading-relaxed text-body">{children}</div>
    </section>
  );
}

export default function Disclosure() {
  return (
    <div className="nt-screen nt-stagger">
      <header className="pt-1">
        <p className="nt-kicker nt-kicker--news">Responsible AI</p>
        <h1 className="nt-h1 mt-1">How we earn your trust</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-body">
          Models, sources, privacy, and failure modes — written plainly for families and reviewers.
        </p>
      </header>

      <Card tone="blue" icon="scale" title="No binary verdicts">
        NomaeTrust shows sources, dates, and confidence bands. We never auto-label a claim TRUE or FALSE. Urgent or
        low-confidence items route to human validators who can attach a provenance badge.
      </Card>

      <Card tone="lilac" icon="lock" title="Privacy">
        <ul className="space-y-2">
          {PRIVACY.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-lilac">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="mint" icon="chip" title="Models & APIs">
        <ul className="space-y-2">
          {MODELS.map((m) => (
            <li key={m.name} className="flex flex-wrap items-center justify-between gap-1 rounded-2xl bg-surface-2 px-3.5 py-2.5">
              <span className="font-bold text-ink">{m.name}</span>
              <span className="text-[12px] text-muted">{m.tier}</span>
              <span className="rounded-full bg-blue-soft px-2 py-0.5 text-[11px] font-bold text-blue-deep">{m.cost}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="pink" icon="book" title="Public demo sources">
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nt-chip nt-press"
            >
              {s.name} ↗
            </a>
          ))}
        </div>
      </Card>

      <Card tone="butter" icon="flask" title="Synthetic test data">
        Demo voice scenarios use volunteer-style scripts; low-bitrate audio can be simulated by re-encoding to 12 kbps
        MP3. Call verification uses simulated speaker matching — disclosed to judges.
      </Card>

      <Card tone="blue" icon="lifebuoy" title="Failure modes & mitigations">
        <ul className="space-y-2">
          {FAILURES.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-blue">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link to="/trust-map" className="nt-btn nt-btn-primary nt-press mt-4 inline-flex" style={{ fontSize: 14, padding: "11px 18px" }}>
          View Confusion Map & validators
        </Link>
      </Card>
    </div>
  );
}
