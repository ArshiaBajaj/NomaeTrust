import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const MODELS = [
  { name: "OpenAI Whisper", tier: "Open-source / API", cost: "Free tier available" },
  { name: "GPT-4o-mini", tier: "Claim extraction, OCR, evidence cards", cost: "Paid API" },
  { name: "Google Fact Check Tools API", tier: "News Watch — ClaimReview search", cost: "Free API key" },
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
              Context Trace runs GPT-4o vision analysis on uploaded images to compare
              original context vs. viral narratives — not binary fake/true verdicts.
            </li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">News Watch methodology</h2>
          <p className="card-body-text mt-3 text-sm">
            News Watch does not label outlets as &quot;fake news.&quot; Outlet tiers (A–D) are
            curated using public criteria: wire services, IFCN signatory status, established
            newsroom practices, and documented fact-check history. Claim matches come from
            third-party fact-checkers via Google&apos;s ClaimReview search (or demo data when
            the API key is unavailable). AI output is always presented as a suggestion with
            confidence bands — not a verdict.
          </p>
          <p className="card-body-text mt-3 text-sm">
            <strong>Share from news apps:</strong> After adding NomaeTrust to your Home Screen,
            use Share in Apple News, Google News, Safari, or other news apps and choose
            NomaeTrust to verify the story (Web Share Target API, iOS 16.4+).
          </p>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">Two products, one trust layer</h2>
          <p className="card-body-text mt-3 text-sm">
            NomaeTrust is split by audience. Platforms use a publish gate to regulate
            what content goes live; individuals use a major-claims feed to focus on
            high-impact rumors — not every forwarded meme.
          </p>
          <ul className="card-body-text mt-3 list-inside list-disc space-y-2 text-sm">
            <li>
              <strong>Platforms:</strong> <code>POST /api/platform/submit</code> returns
              <code>approved</code>, <code>hold</code>, or <code>blocked</code> before
              publication. Human moderators can override any decision.
            </li>
            <li>
              <strong>Individuals:</strong> <code>GET /api/map/claims/major</code> surfaces
              urgent, refuted, and news-sourced claims from the Confusion Map.
            </li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="card-title text-lg">Reddit &amp; Discord extensions</h2>
          <p className="card-body-text mt-3 text-sm">
            NomaeTrust meets rumors where they spread — without auto-scanning messages or
            spamming TRUE/FALSE labels. All surfaces are opt-in only.
          </p>
          <ul className="card-body-text mt-3 list-inside list-disc space-y-2 text-sm">
            <li>
              <strong>Discord bot:</strong> Use <code>/verify</code> or right-click a message
              and choose &quot;Verify with NomaeTrust.&quot; Replies include outlet context,
              ClaimReview citations, and action steps — not a verdict. Rate limited to 10
              verifies per user per hour.
            </li>
            <li>
              <strong>Browser extension (Chrome MV3):</strong> On reddit.com and discord.com,
              click &quot;Verify with NomaeTrust&quot; on posts and messages. Calls the same
              Extension API and links to the full Action Card PWA.
            </li>
            <li>
              <strong>Extension API:</strong> <code>POST /api/extension/verify</code> with
              platform <code>reddit</code>, <code>discord</code>, or <code>web</code>. Protected
              by <code>X-NomaeTrust-Key</code> when configured. Results sync to the Confusion
              Map under News with platform-specific categories.
            </li>
          </ul>
          <p className="card-body-text mt-3 text-sm">
            Discord desktop and Reddit mobile apps cannot run browser extensions — the bot
            covers those surfaces. We do not auto-moderate channels or replace human moderators.
          </p>
        </section>

        <section className="card p-6">
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
