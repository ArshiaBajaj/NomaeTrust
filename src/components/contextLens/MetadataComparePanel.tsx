import { useState } from "react";
import type { MetadataDiscrepancy, ProvenanceEvent } from "../../types/contextLens";

type MetadataComparePanelProps = {
  events: ProvenanceEvent[];
  discrepancies: MetadataDiscrepancy[];
};

type ViewMode = "original" | "current" | "compare";

export default function MetadataComparePanel({
  events,
  discrepancies,
}: MetadataComparePanelProps) {
  const [view, setView] = useState<ViewMode>("compare");
  const [expanded, setExpanded] = useState(false);

  const originalEvent = events[0];
  const currentEvent = events[events.length - 1] ?? events[0];
  const originalYear = originalEvent?.year ?? "Original";
  const currentYear = currentEvent?.year ?? "Current";

  if (!originalEvent) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
        Compare Metadata
      </h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setView("original");
            setExpanded(true);
          }}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
            view === "original" && expanded
              ? "border-success/40 bg-success/10 text-success"
              : "border-[rgba(0,0,0,0.08)] text-text-muted"
          }`}
        >
          EXIF — Original ({originalYear})
        </button>
        <button
          type="button"
          onClick={() => {
            setView("current");
            setExpanded(true);
          }}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
            view === "current" && expanded
              ? "border-secondary/40 bg-secondary/10 text-secondary"
              : "border-[rgba(0,0,0,0.08)] text-text-muted"
          }`}
        >
          EXIF — Current ({currentYear})
        </button>
        <button
          type="button"
          onClick={() => {
            setView("compare");
            setExpanded(true);
          }}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
            view === "compare" && expanded
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-[rgba(0,0,0,0.08)] text-text-muted"
          }`}
        >
          Show discrepancies
        </button>
      </div>

      {expanded && view === "original" && (
        <MetadataCard
          title={`${originalYear} — original EXIF`}
          tone="success"
          metadata={originalEvent.metadata}
        />
      )}

      {expanded && view === "current" && currentEvent && (
        <MetadataCard
          title={`${currentYear} — current metadata`}
          tone="secondary"
          metadata={currentEvent.metadata}
        />
      )}

      {expanded && view === "compare" && (
        <div className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.06)]">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-surface-raised">
                <th className="px-3 py-2 font-semibold text-text-muted">Field</th>
                <th className="px-3 py-2 font-semibold text-success">{originalYear}</th>
                <th className="px-3 py-2 font-semibold text-secondary">{currentYear}</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((row) => (
                <tr key={row.field} className="border-b border-[rgba(0,0,0,0.04)] last:border-0">
                  <td className="px-3 py-2.5 font-semibold text-navy">{row.field}</td>
                  <td className="px-3 py-2.5 text-text-body">{row.original}</td>
                  <td className="px-3 py-2.5 font-medium text-secondary">{row.current}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MetadataCard({
  title,
  tone,
  metadata,
}: {
  title: string;
  tone: "success" | "secondary";
  metadata: { gps: string; captured: string; published: string; device?: string };
}) {
  const border =
    tone === "success" ? "border-success/30 bg-success/5" : "border-secondary/30 bg-secondary/5";

  return (
    <div className={`rounded-xl border p-4 ${border}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{title}</p>
      <dl className="mt-3 space-y-2 text-[11px]">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="capitalize text-text-muted">{key}</dt>
            <dd className="text-right font-medium text-text-body">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
