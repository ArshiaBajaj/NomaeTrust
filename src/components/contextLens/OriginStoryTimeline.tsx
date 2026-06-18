import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProvenanceEvent } from "../../types/contextLens";
import ThumbnailPlaceholder from "./ThumbnailPlaceholder";

type OriginStoryTimelineProps = {
  events: ProvenanceEvent[];
  timelineMinYear: number;
  timelineMaxYear: number;
  defaultPosition?: number;
  onPositionChange?: (position: number, event: ProvenanceEvent) => void;
};

function eventAtPosition(
  position: number,
  events: ProvenanceEvent[],
  minYear: number,
  maxYear: number,
): ProvenanceEvent {
  const [start, end] = events;
  if (!end) return start;
  const year = minYear + position * (maxYear - minYear);
  const midpoint = (minYear + maxYear) / 2;
  if (year <= midpoint) return start;
  return end;
}

export default function OriginStoryTimeline({
  events,
  timelineMinYear,
  timelineMaxYear,
  defaultPosition = 1,
  onPositionChange,
}: OriginStoryTimelineProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [startEvent, endEvent] = events;

  useEffect(() => {
    setPosition(defaultPosition);
  }, [defaultPosition, events]);

  const activeEvent = useMemo(
    () => eventAtPosition(position, events, timelineMinYear, timelineMaxYear),
    [position, events, timelineMinYear, timelineMaxYear],
  );

  const currentYear = Math.round(
    timelineMinYear + position * (timelineMaxYear - timelineMinYear),
  );

  const updatePosition = useCallback(
    (next: number) => {
      const clamped = Math.min(1, Math.max(0, next));
      setPosition(clamped);
      onPositionChange?.(
        clamped,
        eventAtPosition(clamped, events, timelineMinYear, timelineMaxYear),
      );
    },
    [events, onPositionChange, timelineMinYear, timelineMaxYear],
  );

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    updatePosition(ratio);
  };

  if (!startEvent) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
          Origin Story
        </h2>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
          {currentYear}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => updatePosition(0)}
          className={`rounded-xl border p-2 text-left transition ${
            position < 0.5
              ? "border-accent/40 bg-accent/5"
              : "border-[rgba(0,0,0,0.06)] bg-white"
          }`}
        >
          <ThumbnailPlaceholder
            variant={startEvent.thumbnailVariant}
            imageUrl={startEvent.imageUrl}
            size="sm"
            badge="verified"
          />
          <p className="mt-2 text-[10px] font-bold leading-tight text-success">
            {startEvent.label}
          </p>
          <p className="mt-0.5 text-[9px] text-text-muted">{startEvent.year}</p>
        </button>

        {endEvent && (
          <button
            type="button"
            onClick={() => updatePosition(1)}
            className={`rounded-xl border p-2 text-left transition ${
              position >= 0.5
                ? "border-secondary/40 bg-secondary/5"
                : "border-[rgba(0,0,0,0.06)] bg-white"
            }`}
          >
            <ThumbnailPlaceholder
              variant={endEvent.thumbnailVariant}
              imageUrl={endEvent.imageUrl}
              size="sm"
              badge="disputed"
            />
            <p className="mt-2 text-[10px] font-bold leading-tight text-secondary">
              {endEvent.label}
            </p>
            <p className="mt-0.5 text-[9px] text-text-muted">{endEvent.year}</p>
          </button>
        )}
      </div>

      <div
        className="relative mt-2 cursor-pointer px-1 py-4"
        onClick={handleTrackClick}
        role="slider"
        aria-valuemin={timelineMinYear}
        aria-valuemax={timelineMaxYear}
        aria-valuenow={currentYear}
        aria-label="Origin story timeline"
      >
        <div className="h-1.5 rounded-full bg-gradient-to-r from-success/30 via-accent/20 to-secondary/30" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent/40"
          style={{ left: "4px", width: `calc(${position * 100}% - 4px)` }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-md ring-4 ring-accent/20"
          style={{ left: `calc(${position * 100}%)` }}
        />
        <div className="mt-3 flex justify-between text-[10px] font-semibold text-text-muted">
          <span>{timelineMinYear}</span>
          <span>{timelineMaxYear}</span>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(position * 100)}
        onChange={(e) => updatePosition(Number(e.target.value) / 100)}
        className="w-full accent-accent"
        aria-label="Timeline position"
      />

      <div
        className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-surface-raised p-4 transition-opacity"
        key={`${activeEvent.year}-${activeEvent.headline}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          {activeEvent.source}
        </p>
        <p className="mt-2 text-sm font-semibold leading-snug text-navy">
          {activeEvent.headline}
        </p>
        <dl className="mt-3 grid gap-1.5 text-[11px]">
          <div className="flex justify-between gap-2">
            <dt className="text-text-muted">GPS</dt>
            <dd className="text-right font-medium text-text-body">{activeEvent.metadata.gps}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-muted">Captured</dt>
            <dd className="text-right font-medium text-text-body">
              {activeEvent.metadata.captured}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
