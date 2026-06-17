import { useState } from "react";
import ConfidenceMeter from "./ConfidenceMeter";
import RiskGauge from "./RiskGauge";
import VerificationStatusBadge from "./VerificationStatusBadge";
import type {
  AudioAnalysisResult,
  EvidenceCard as EvidenceCardType,
} from "../types";
import {
  computeHarmRiskScore,
  copyReport,
  downloadPdfReport,
  shareReport,
} from "../utils/reportExport";

type IntelligenceReportCardProps = {
  card: EvidenceCardType;
  result: AudioAnalysisResult;
};

const categoryColors: Record<string, string> = {
  Education: "text-sky-400 bg-sky-500/10 ring-sky-500/20",
  Health: "text-rose-400 bg-rose-500/10 ring-rose-500/20",
  "Public Safety": "text-orange-400 bg-orange-500/10 ring-orange-500/20",
  Government: "text-violet-400 bg-violet-500/10 ring-violet-500/20",
  "Community Services": "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  Transportation: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20",
};

export default function IntelligenceReportCard({
  card,
  result,
}: IntelligenceReportCardProps) {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const intel = card.regionalIntelligence;
  const statusLabel = card.statusLabel ?? card.status;
  const riskScore = computeHarmRiskScore(result);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleCopy = async () => {
    const ok = await copyReport(result, card);
    showFeedback(ok ? "Report copied to clipboard" : "Copy failed");
  };

  const handleDownload = async () => {
    await downloadPdfReport(result, card);
    showFeedback("PDF report downloaded");
  };

  const handleShare = async () => {
    const outcome = await shareReport(result, card);
    if (outcome === "shared") showFeedback("Report shared");
    else if (outcome === "copied") showFeedback("Report copied (share unavailable)");
    else showFeedback("Share cancelled");
  };

  return (
    <article className="animate-fade-in-up overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-2xl shadow-black/40">
      {/* Official header band */}
      <div className="border-b border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                NomaeTrust Intelligence Division
              </p>
              <h3 className="mt-0.5 text-lg font-bold tracking-tight text-white">
                Official Evidence Card
              </h3>
              <p className="mt-1 font-mono text-[11px] text-slate-500">
                REF: {card.id} · CLASSIFICATION: UNVERIFIED
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {card.demoMode && (
              <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Demo Mode
              </span>
            )}
            {intel && (
              <span className="rounded border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-300">
                Regional Intelligence
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 px-6 py-3">
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={handleCopy} icon="copy">
            Copy Report
          </ActionButton>
          <ActionButton onClick={handleDownload} icon="download">
            Download PDF
          </ActionButton>
          <ActionButton onClick={handleShare} icon="share">
            Share Card
          </ActionButton>
        </div>
        {actionFeedback && (
          <span className="animate-fade-in text-xs font-medium text-emerald-400">
            {actionFeedback}
          </span>
        )}
      </div>

      <div className="space-y-6 p-6">
        {/* Status + metrics row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex items-center lg:col-span-1">
            <VerificationStatusBadge label={statusLabel} />
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 lg:col-span-1">
            <ConfidenceMeter value={card.confidence} />
          </div>
          <div className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 p-4 lg:col-span-1">
            <RiskGauge score={riskScore} />
          </div>
        </div>

        {/* Primary claim */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Primary Extracted Claim
          </p>
          <p className="mt-3 text-base font-medium leading-relaxed text-white">
            {card.claim}
          </p>
        </div>

        {/* Transcript excerpt */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Source Transcript
          </p>
          <p className="mt-3 border-l-2 border-blue-500/40 pl-4 text-sm italic leading-relaxed text-slate-400">
            &ldquo;{result.transcript}&rdquo;
          </p>
        </div>

        {/* Analysis */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Intelligence Assessment
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {card.sources.map((source) => (
              <span
                key={source}
                className="rounded border border-slate-700 bg-slate-800/50 px-2.5 py-1 font-mono text-[10px] text-slate-400"
              >
                {source}
              </span>
            ))}
          </div>
        </div>

        {/* Regional intelligence */}
        {intel && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Regional Intelligence — Atlanta / Georgia
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                {intel.claimCategory}
              </span>
              <span
                className={`rounded border px-2.5 py-1 text-xs font-medium ring-1 ${categoryColors[intel.sourceCategory] ?? "text-slate-400 border-slate-700"}`}
              >
                {intel.sourceCategory}
              </span>
              {intel.locations.map((loc) => (
                <span
                  key={loc}
                  className="rounded border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-400"
                >
                  {loc}
                </span>
              ))}
            </div>

            {intel.recommendedSources.length > 0 && (
              <div className="mt-5 border-t border-blue-500/10 pt-5">
                <p className="text-sm font-semibold text-white">
                  Recommended Verification Sources
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Official Atlanta &amp; Georgia sources for independent claim verification.
                </p>
                <ul className="mt-4 space-y-2">
                  {intel.recommendedSources.map((source) => (
                    <li
                      key={source.id}
                      className="group rounded-lg border border-slate-700/50 bg-slate-900/40 p-3 transition-all hover:border-blue-500/30 hover:bg-slate-900/60"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-300 transition-colors group-hover:text-blue-200"
                        >
                          {source.name} ↗
                        </a>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] ring-1 ${categoryColors[source.category] ?? "text-slate-400 bg-slate-800 ring-slate-700"}`}
                        >
                          {source.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {source.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer stamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/80 px-6 py-4">
        <p className="font-mono text-[10px] text-slate-600">
          Generated {new Date(card.verifiedAt).toLocaleString()} · NomaeTrust v1.0
        </p>
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-600">
          Verify Before Harm Spreads
        </p>
      </div>
    </article>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: "copy" | "download" | "share";
}) {
  const icons = {
    copy: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    ),
    download: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    ),
    share: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.002.356.026.525.076a2.25 2.25 0 012.743 2.743c-.049.169-.073.345-.075.525m2.247-6.751a2.25 2.25 0 113.182 3.182l-3.182-3.182zm-4.5 0a2.25 2.25 0 100-2.186m0 2.186c-.18-.002-.356-.026-.525-.076a2.25 2.25 0 00-2.743-2.743c.049-.169.073-.345.075-.525M3.047 10.907a2.25 2.25 0 113.182-3.182l3.182 3.182" />
    ),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {icons[icon]}
      </svg>
      {children}
    </button>
  );
}
