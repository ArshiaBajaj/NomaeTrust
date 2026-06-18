import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const MODELS = [
  { name: "OpenAI Whisper", tier: "Open-source / API", cost: "Free tier available" },
  { name: "GPT-4o-mini", tier: "Claim extraction, OCR, evidence cards", cost: "Paid API" },
  { name: "Leaflet + OpenStreetMap", tier: "Confusion Map", cost: "Free" },
  { name: "Local voice passports", tier: "On-device localStorage", cost: "Free" },
];

const PUBLIC_SOURCES = [
  { name: "Atlanta Community Food Bank", url: "https://www.acfb.org" },
  { name: "Georgia DPH", url: "https://dph.georgia.gov" },
  { name: "City of Atlanta", url: "https://www.atlantaga.gov" },
  { name: "Fulton County Government", url: "https://www.fultoncountyga.gov" },
  { name: "GEMA", url: "https://gema.georgia.gov" },
  { name: "United Way of Greater Atlanta", url: "https://www.unitedwayatlanta.org" },
];

export default function Disclosure() {
  return (
    <div className="page-shell">
      <PageHeader
        title="Responsible AI & data disclosure"
        description="Models, sources, privacy practices, and failure modes for judges and reviewers."
      />

      <div className="mx-auto max-w-[900px] space-y-8 px-6 pb-20 pt-10 lg:px-8">
        <section className="card p-6">
          <h2 className="card-title text-lg">No binary verdicts</h2>
          <p className="card-body-text mt-3 text-sm">
            NomaeTrust presents sources, dates, and confidence bands. We do not
            auto-label claims TRUE or FALSE. Urgent or low-confidence items route
            to human validators who can attach provenance badges.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">Privacy</h2>
          <ul className="card-body-text mt-3 list-inside list-disc space-y-2 text-sm">
            <li>Voice passports stored encrypted on-device (localStorage demo).</li>
            <li>Audio processed ephemerally — not persisted after analysis.</li>
            <li>Confusion Map stores anonymized claim metadata at neighborhood level — one pin per rumor.</li>
            <li>
              Trust Circle uses demo session tokens (stored in localStorage) and
              in-memory family data on the server — not production authentication.
              Invite codes connect family members for hackathon demonstration only.
            </li>
            <li>
              ContextLens runs real deepfake risk scans (GPT-4o vision) on uploaded images
              and URLs. Scores ≥65% are tracked on the Confusion Map as synthetic media
              alerts — not binary fake/true verdicts.
            </li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">Models &amp; APIs</h2>
          <ul className="mt-4 space-y-3">
            {MODELS.map((m) => (
              <li
                key={m.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[rgba(0,0,0,0.06)] bg-surface-raised px-4 py-3 text-sm"
              >
                <span className="font-semibold text-navy">{m.name}</span>
                <span className="text-text-muted">{m.tier}</span>
                <span className="text-xs text-accent">{m.cost}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">Public demo sources (RAG whitelist)</h2>
          <ul className="mt-4 space-y-2">
            {PUBLIC_SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">Synthetic test data</h2>
          <p className="card-body-text mt-3 text-sm">
            Demo voice scenarios use volunteer-style scripts. Low-bitrate audio can
            be simulated by re-encoding clips to 12 kbps MP3. Call verification
            uses simulated speaker matching for hackathon demonstration — disclosed
            to judges.
          </p>
        </section>

        <section className="card border-accent/20 p-6">
          <h2 className="card-title text-lg">Failure modes &amp; mitigations</h2>
          <ul className="card-body-text mt-3 list-inside list-disc space-y-2 text-sm">
            <li>Low confidence → recommend human review / call back known number.</li>
            <li>Validator authentication + rate limits on fast-lane badges.</li>
            <li>Community opt-out for Confusion Map pin aggregation (future).</li>
          </ul>
          <Link to="/trust-map" className="btn-primary mt-6 inline-flex">
            View Confusion Map &amp; validator queue
          </Link>
        </section>
      </div>
    </div>
  );
}
