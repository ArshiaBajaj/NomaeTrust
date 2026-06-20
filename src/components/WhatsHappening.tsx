import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon3D, { type Icon3DName } from "./Icon3D";
import { mockCommunityClaims } from "../data/mockClaims";
import { useHaptic } from "../hooks/useHaptic";
import { actionCardUrlForClaim, getCommunityClaims } from "../services/map";
import type { Claim, VerificationStatus } from "../types";

const VERDICT: Record<VerificationStatus, { label: string; color: string; soft: string }> = {
  verified: { label: "Verified", color: "#1f9d63", soft: "#e3f8f0" },
  unverified: { label: "Unverified", color: "#e0455f", soft: "#ffedf2" },
  disputed: { label: "Disputed", color: "#cf7a16", soft: "#fff6dd" },
  pending: { label: "Checking", color: "#5a76e0", soft: "#eaf0fe" },
};

type Topic = { label: string; icon: Icon3DName; grad: string; kw: string };

function topicOf(text: string): Topic {
  const t = text.toLowerCase();
  if (/water|contaminat|boil|bacteria/.test(t)) return { label: "Public Health", icon: "flask", grad: "var(--grad-blue)", kw: "water" };
  if (/school|class|closure/.test(t)) return { label: "Schools", icon: "book", grad: "var(--grad-lilac)", kw: "school" };
  if (/vaccine|clinic|hospital|health|screening/.test(t)) return { label: "Health", icon: "flask", grad: "var(--grad-mint)", kw: "hospital" };
  if (/food|bank|meal|grocery/.test(t)) return { label: "Food Aid", icon: "book", grad: "var(--grad-butter)", kw: "grocery" };
  if (/wire|transfer|account|scam|money|\$|fraud/.test(t)) return { label: "Scam Alert", icon: "lock", grad: "var(--grad-pink)", kw: "smartphone" };
  if (/curfew|power|grid|emergency|evacuat|storm|outbreak/.test(t)) return { label: "Emergency", icon: "lifebuoy", grad: "linear-gradient(150deg,#ffb0c2,#ff5a6e)", kw: "storm" };
  if (/transport|bus|train|transit|road/.test(t)) return { label: "Transit", icon: "pin", grad: "var(--grad-blue)", kw: "bus" };
  return { label: "Community", icon: "scale", grad: "var(--grad-lilac)", kw: "city" };
}

function ago(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function rank(c: Claim): number {
  const urgency = c.urgentReview ? 100 : 0;
  const sw = c.status === "unverified" ? 30 : c.status === "disputed" ? 24 : c.status === "pending" ? 18 : 6;
  return urgency + sw - new Date(c.extractedAt).getTime() / 1e11;
}

function lockOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 1000;
}

function Pill({ status }: { status: VerificationStatus }) {
  const v = VERDICT[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.04em]"
      style={{ background: v.soft, color: v.color }}
    >
      {v.label}
    </span>
  );
}

/** Photo cover with graceful fallback to the topic gradient + glyph. */
function Cover({ id, topic, className, children }: { id: string; topic: Topic; className?: string; children?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} style={{ background: topic.grad }}>
      {!failed ? (
        <img
          src={`https://loremflickr.com/600/400/${topic.kw}?lock=${lockOf(id)}`}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute -right-2 -top-3 opacity-90" style={{ width: 84, height: 84 }} aria-hidden>
          <Icon3D name={topic.icon} />
        </span>
      )}
      {children}
    </div>
  );
}

export default function WhatsHappening({ glass = false }: { glass?: boolean }) {
  const haptic = useHaptic();
  const [claims, setClaims] = useState<Claim[]>(mockCommunityClaims);
  const headlineStyle: CSSProperties | undefined = glass ? { color: "#fff" } : undefined;
  const metaCls = glass ? "text-white/75" : "text-muted";

  useEffect(() => {
    let alive = true;
    getCommunityClaims()
      .then((live) => {
        if (alive && live.length > 0) setClaims(live);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const items = [...claims].sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  const [lead, ...rest] = items;
  if (!lead) return null;
  const leadTopic = topicOf(lead.text);

  return (
    <section
      className={`${glass ? "nt-gcard" : "nt-card"} overflow-hidden p-0`}
      style={glass ? ({ "--color-hairline": "rgba(255,255,255,0.24)" } as CSSProperties) : undefined}
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: glass ? "#fff" : "#e0455f", animation: "claim-pulse 1.6s ease-in-out infinite" }}
            aria-hidden
          />
          <h2 className="text-[18px] font-extrabold tracking-tight" style={{ color: glass ? "#fff" : "var(--color-headline)" }}>
            What&apos;s happening
          </h2>
        </div>
        <Link to="/trust-map" onClick={() => haptic("light")} className="text-[13px] font-bold" style={{ color: glass ? "#fff" : "var(--color-coral)" }}>
          See all
        </Link>
      </div>

      {/* lead story — photo with overlaid headline (social-post style) */}
      <Link to={actionCardUrlForClaim(lead)} onClick={() => haptic("light")} className="nt-press block">
        <Cover id={lead.id} topic={leadTopic} className="h-[176px]">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,8,30,0.08) 0%, rgba(10,8,30,0.78) 100%)" }} />
          <span
            className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.05em]"
            style={{ color: lead.urgentReview ? "#e0455f" : VERDICT[lead.status].color }}
          >
            {lead.urgentReview ? "● Breaking" : leadTopic.label}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="text-[18px] font-extrabold leading-snug text-white" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
              {lead.text}
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-white/85">
              <Pill status={lead.status} />
              <span>·</span>
              <span>{lead.location?.label ?? "Community"}</span>
              <span>·</span>
              <span>{ago(lead.extractedAt)}</span>
            </p>
          </div>
        </Cover>
      </Link>

      {/* compact rows with photo thumbnails */}
      <div className="nt-divide border-t border-[var(--color-hairline)]">
        {rest.map((c) => {
          const topic = topicOf(c.text);
          return (
            <Link
              key={c.id}
              to={actionCardUrlForClaim(c)}
              onClick={() => haptic("light")}
              className="nt-press flex items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <Pill status={c.status} />
                <h3 className="nt-headline mt-1.5 line-clamp-2 text-[14.5px] font-extrabold" style={headlineStyle}>
                  {c.text}
                </h3>
                <p className={`mt-1 text-[11px] ${metaCls}`}>
                  {topic.label} · {c.location?.label ?? "Community"} · {ago(c.extractedAt)}
                </p>
              </div>
              <Cover id={c.id} topic={topic} className="h-[66px] w-[66px] shrink-0 rounded-2xl" />
            </Link>
          );
        })}
      </div>

      <Link
        to="/trust-map"
        onClick={() => haptic("light")}
        className="nt-press flex items-center justify-center gap-1 py-3.5 text-[13px] font-bold"
        style={{ color: glass ? "#fff" : "var(--color-coral)", borderTop: "1px solid var(--color-hairline)" }}
      >
        Show more on the Confusion Map →
      </Link>
    </section>
  );
}
