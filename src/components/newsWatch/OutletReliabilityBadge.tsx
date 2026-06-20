import { useState } from "react";
import type { NewsOutlet } from "../../types";

type OutletReliabilityBadgeProps = {
  outlet: NewsOutlet;
  compact?: boolean;
};

const TIER_STYLES: Record<string, string> = {
  A: "nw-tier-a",
  B: "nw-tier-b",
  C: "nw-tier-c",
  D: "nw-tier-d",
};

export default function OutletReliabilityBadge({
  outlet,
  compact = false,
}: OutletReliabilityBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const tierClass = TIER_STYLES[outlet.tier] ?? "nw-tier-b";

  return (
    <div className={`nw-outlet-badge ${tierClass}`}>
      <div className="nw-outlet-badge-header">
        <div>
          <p className="nw-outlet-name">{outlet.name}</p>
          <p className="nw-outlet-tier">
            Tier {outlet.tier} · {outlet.tierLabel}
            {outlet.ifcnSignatory && " · IFCN"}
          </p>
        </div>
        {!compact && (
          <button
            type="button"
            className="ios-text-btn nw-outlet-more"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Less" : "Nutrition label"}
          </button>
        )}
      </div>
      {(expanded || compact) && (
        <p className="nw-outlet-summary">{outlet.nutritionSummary}</p>
      )}
      {outlet.homepageUrl && (
        <a
          href={outlet.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nw-outlet-link"
        >
          Visit publisher →
        </a>
      )}
    </div>
  );
}
