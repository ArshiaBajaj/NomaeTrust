import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import L from "leaflet";
import { Circle, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Claim, MapHotspot, OfficialFeedPin } from "../types";
import { actionCardUrlForClaim } from "../services/map";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

type ConfusionMapProps = {
  claims: Claim[];
  hotspots?: MapHotspot[];
  officialFeeds?: OfficialFeedPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onHotspotClick?: (hotspot: MapHotspot) => void;
  showHeat?: boolean;
  showOfficialFeeds?: boolean;
  fitBoundsKey?: string;
  skipAutoFit?: boolean;
};

// Pastel-tuned status colors (kept perceptually close to the previous palette
// but aligned with the new design tokens used elsewhere).
const STATUS_COLOR: Record<Claim["status"], string> = {
  verified: "#6fcf9f",
  unverified: "#ff7a8a",
  disputed: "#ffc23f",
  pending: "#6e8bf0",
};

const STATUS_LABEL: Record<Claim["status"], string> = {
  verified: "Community verified",
  unverified: "Unverified",
  disputed: "Disputed",
  pending: "Pending review",
};

const SOURCE_LABEL: Record<Claim["source"], string> = {
  voice: "Voice note",
  screenshot: "Screenshot",
  call: "Phone call",
  community: "Community report",
  deepfake: "Synthetic media",
  "context-trace": "Context Trace",
};

const ANALYSIS_LABEL: Record<NonNullable<Claim["analysisOutcome"]>, string> = {
  verified: "AI suggests supported",
  not_verified: "AI suggests refuted",
  inconclusive: "AI inconclusive",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function claimIcon(claim: Claim, selected: boolean): L.DivIcon {
  const color = STATUS_COLOR[claim.status];
  const urgent = claim.urgentReview ? " claim-pin--urgent" : "";
  const sel = selected ? " claim-pin--selected" : "";
  return L.divIcon({
    className: "claim-pin-wrap",
    html: `<div class="claim-pin${urgent}${sel}" style="background:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function officialIcon(feed: OfficialFeedPin): L.DivIcon {
  return L.divIcon({
    className: "official-pin-wrap",
    html: `<div class="official-pin" title="${escapeHtml(feed.name)}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function popupHtml(claim: Claim): string {
  const time = new Date(claim.extractedAt).toLocaleString();
  const conf = Math.round(claim.confidence * 100);
  const loc = escapeHtml(claim.location?.label ?? "Atlanta area");
  const text = escapeHtml(claim.text);
  const category = claim.category ? escapeHtml(claim.category) : "";
  const badge = claim.provenanceBadge
    ? `<p class="claim-popup-badge">✓ ${escapeHtml(claim.provenanceBadge)}</p>`
    : "";
  const urgent = claim.urgentReview
    ? `<span class="claim-popup-urgent">URGENT</span>`
    : "";
  const analysis = claim.analysisOutcome
    ? `<p class="claim-popup-ai">${ANALYSIS_LABEL[claim.analysisOutcome]}</p>`
    : "";
  const artifact = claim.artifactLabel
    ? `<p class="claim-popup-artifact">${escapeHtml(claim.artifactLabel)}</p>`
    : "";
  const sources =
    claim.sourceReferences && claim.sourceReferences.length > 0
      ? `<ul class="claim-popup-sources">${claim.sourceReferences
          .slice(0, 2)
          .map(
            (s) =>
              `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a></li>`,
          )
          .join("")}</ul>`
      : "";
  const actionCard = `<a class="claim-popup-action" href="${actionCardUrlForClaim(claim.id)}">View Action Card →</a>`;
  const externalAction =
    claim.primaryActionUrl && claim.primaryActionLabel
      ? `<a class="claim-popup-action claim-popup-action--secondary" href="${escapeHtml(claim.primaryActionUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(claim.primaryActionLabel)}</a>`
      : "";

  return `
    <div class="claim-popup">
      <p class="claim-popup-meta">
        ${SOURCE_LABEL[claim.source]}${category ? ` · ${category}` : ""}
      </p>
      <p class="claim-popup-text">${text}</p>
      <p class="claim-popup-detail">
        <span class="claim-popup-status claim-popup-status--${claim.status}">${STATUS_LABEL[claim.status]}</span>
        · ${loc} · ${conf}% confidence
      </p>
      <p class="claim-popup-time">${time}</p>
      ${urgent}
      ${analysis}
      ${artifact}
      ${sources}
      ${actionCard}
      ${externalAction}
      ${badge}
    </div>
  `;
}

function officialPopupHtml(feed: OfficialFeedPin): string {
  return `
    <div class="claim-popup claim-popup--official">
      <p class="claim-popup-meta">Official source · ${escapeHtml(feed.category)}</p>
      <p class="claim-popup-text">${escapeHtml(feed.name)}</p>
      <p class="claim-popup-detail">${escapeHtml(feed.label)}</p>
      <p class="claim-popup-time">${escapeHtml(feed.summary)}</p>
      <a class="claim-popup-action" href="${escapeHtml(feed.url)}" target="_blank" rel="noopener noreferrer">Open official site →</a>
    </div>
  `;
}

function ClaimClusterLayer({
  claims,
  selectedId,
  onSelect,
  markersRef,
}: {
  claims: Claim[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  markersRef: MutableRefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const claimsKey = useMemo(
    () => claims.map((c) => `${c.id}:${c.status}:${c.urgentReview}`).join("|"),
    [claims],
  );

  useEffect(() => {
    markersRef.current.clear();
    const group = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count > 9 ? 44 : 36;
        return L.divIcon({
          html: `<div class="cluster-pin" style="width:${size}px;height:${size}px">${count}</div>`,
          className: "cluster-pin-wrap",
          iconSize: [size, size],
        });
      },
    });

    for (const claim of claims) {
      if (!claim.location) continue;
      const marker = L.marker([claim.location.lat, claim.location.lng], {
        icon: claimIcon(claim, selectedId === claim.id),
      });
      marker.bindPopup(popupHtml(claim), { maxWidth: 300 });
      marker.on("click", () => onSelect?.(claim.id));
      markersRef.current.set(claim.id, marker);
      group.addLayer(marker);
    }

    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimsKey, map, onSelect, markersRef]);

  useEffect(() => {
    for (const claim of claims) {
      const marker = markersRef.current.get(claim.id);
      if (!marker) continue;
      marker.setIcon(claimIcon(claim, selectedId === claim.id));
    }
  }, [selectedId, claims, markersRef]);

  return null;
}

function OfficialFeedLayer({ feeds }: { feeds: OfficialFeedPin[] }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup();
    for (const feed of feeds) {
      const marker = L.marker([feed.lat, feed.lng], { icon: officialIcon(feed) });
      marker.bindPopup(officialPopupHtml(feed), { maxWidth: 280 });
      layer.addLayer(marker);
    }
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [feeds, map]);

  return null;
}

function SelectClaimHandler({
  claim,
  markersRef,
}: {
  claim?: Claim | null;
  markersRef: MutableRefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!claim?.location) return;

    map.flyTo([claim.location.lat, claim.location.lng], 14, { duration: 0.75 });

    const timer = window.setTimeout(() => {
      const marker = markersRef.current.get(claim.id);
      marker?.openPopup();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [claim?.id, claim?.location, map, markersRef]);

  return null;
}

function FitBoundsToClaims({
  claims,
  fitBoundsKey,
  skipAutoFit,
}: {
  claims: Claim[];
  fitBoundsKey?: string;
  skipAutoFit?: boolean;
}) {
  const map = useMap();
  const initialKey = useRef(fitBoundsKey);

  useEffect(() => {
    if (skipAutoFit) return;

    const points = claims
      .filter((c) => c.location)
      .map((c) => [c.location!.lat, c.location!.lng] as [number, number]);

    if (points.length === 0) {
      map.setView([33.749, -84.388], 11);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    if (fitBoundsKey !== initialKey.current) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 13 });
      initialKey.current = fitBoundsKey;
    }
  }, [claims, fitBoundsKey, map, skipAutoFit]);

  return null;
}

function HotspotLayer({
  hotspots,
  onHotspotClick,
}: {
  hotspots: MapHotspot[];
  onHotspotClick?: (hotspot: MapHotspot) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const circles: L.Circle[] = [];
    for (const hotspot of hotspots.filter((h) => h.unverifiedCount > 0)) {
      const circle = L.circle([hotspot.lat, hotspot.lng], {
        radius: 600 + hotspot.unverifiedCount * 180,
        color: hotspot.intensity > 0.6 ? "#ff7a8a" : "#ffc23f",
        fillColor: hotspot.intensity > 0.6 ? "#ff7a8a" : "#ffc23f",
        fillOpacity: 0.07 + hotspot.intensity * 0.08,
        weight: 1.5,
        opacity: 0.4,
      });
      circle.on("click", () => onHotspotClick?.(hotspot));
      circle.addTo(map);
      circles.push(circle);
    }
    return () => {
      for (const circle of circles) map.removeLayer(circle);
    };
  }, [hotspots, map, onHotspotClick]);

  return null;
}

function computeCenter(claims: Claim[]): { lat: number; lng: number } {
  const located = claims.filter((c) => c.location);
  if (located.length === 0) return { lat: 33.749, lng: -84.388 };

  const sum = located.reduce(
    (acc, c) => ({
      lat: acc.lat + c.location!.lat,
      lng: acc.lng + c.location!.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: sum.lat / located.length,
    lng: sum.lng / located.length,
  };
}

export default function ConfusionMap({
  claims,
  hotspots = [],
  officialFeeds = [],
  selectedId,
  onSelect,
  onHotspotClick,
  showHeat = true,
  showOfficialFeeds = true,
  fitBoundsKey,
  skipAutoFit = false,
}: ConfusionMapProps) {
  const located = claims.filter((c) => c.location);
  const center = computeCenter(located);
  const selectedClaim = claims.find((c) => c.id === selectedId) ?? null;
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  return (
    <div className="confusion-map-frame relative h-[58vh] max-h-[560px] min-h-[340px] w-full overflow-hidden rounded-[22px] border border-line shadow-[var(--shadow-soft)]">
      {located.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6">
          <p className="nt-glass rounded-3xl px-4 py-3 text-center text-[13px] font-semibold text-body shadow-[var(--shadow-soft)]">
            No pins match this filter — try another category or report a rumor.
          </p>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {showHeat && hotspots.length > 0 && (
          <HotspotLayer hotspots={hotspots} onHotspotClick={onHotspotClick} />
        )}

        {showHeat &&
          located
            .filter((c) => c.status !== "verified")
            .map((claim) => (
              <Circle
                key={`heat-${claim.id}`}
                center={[claim.location!.lat, claim.location!.lng]}
                radius={claim.urgentReview ? 420 : 280}
                pathOptions={{
                  color: claim.urgentReview ? "#ff7a8a" : "#ffc23f",
                  fillColor: claim.urgentReview ? "#ff7a8a" : "#ffc23f",
                  fillOpacity: 0.1,
                  weight: 1,
                  opacity: 0.28,
                }}
              />
            ))}

        {showOfficialFeeds && officialFeeds.length > 0 && (
          <OfficialFeedLayer feeds={officialFeeds} />
        )}

        <FitBoundsToClaims
          claims={located}
          fitBoundsKey={fitBoundsKey}
          skipAutoFit={skipAutoFit || Boolean(selectedId)}
        />
        <ClaimClusterLayer
          claims={located}
          selectedId={selectedId}
          onSelect={onSelect}
          markersRef={markersRef}
        />
        <SelectClaimHandler claim={selectedClaim} markersRef={markersRef} />
      </MapContainer>
    </div>
  );
}

export function MapLegend({
  showHotspots = true,
  showOfficial = true,
}: {
  showHotspots?: boolean;
  showOfficial?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold text-muted">
      <span className="nt-kicker">Legend</span>
      {(
        [
          ["verified", "Verified", "#6fcf9f"],
          ["pending", "Pending", "#6e8bf0"],
          ["unverified", "Unverified", "#ff7a8a"],
          ["disputed", "Disputed", "#ffc23f"],
        ] as const
      ).map(([, label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-body">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ background: color }}
          />
          {label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 text-body">
        <span className="claim-pin claim-pin--urgent inline-block h-2.5 w-2.5 rounded-full bg-danger" />
        Urgent pulse
      </span>
      {showHotspots && (
        <span className="inline-flex items-center gap-1.5 text-body">
          <span className="inline-block h-3 w-3 rounded-full border border-yellow-deep/40 bg-yellow/20" />
          Confusion zone
        </span>
      )}
      {showOfficial && (
        <span className="inline-flex items-center gap-1.5 text-body">
          <span className="official-pin inline-block h-2.5 w-2.5 rounded-full" />
          Official feed
        </span>
      )}
    </div>
  );
}

const DETAIL_STATUS_TONE: Record<Claim["status"], string> = {
  verified: "bg-mint-soft text-[#2f8f68]",
  unverified: "bg-pink-soft text-pink-deep",
  disputed: "bg-yellow-soft text-yellow-deep",
  pending: "bg-blue-soft text-blue-deep",
};

export function ClaimMapDetail({
  claim,
  compact = false,
}: {
  claim: Claim;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="nt-kicker">Selected rumor</span>
        <span
          className={`rounded-pill px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${DETAIL_STATUS_TONE[claim.status]}`}
        >
          {claim.status}
        </span>
      </div>

      <p className="text-[14px] font-bold leading-snug text-ink">{claim.text}</p>

      <dl className="grid gap-2 text-[12px]">
        {claim.analysisOutcome && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">AI analysis</dt>
            <dd className="font-semibold text-lilac">{ANALYSIS_LABEL[claim.analysisOutcome]}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">Source</dt>
          <dd className="font-semibold capitalize text-body">{claim.source}</dd>
        </div>
        {claim.location && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">Area</dt>
            <dd className="font-semibold text-body">{claim.location.label}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">Confidence</dt>
          <dd className="font-semibold text-body">{Math.round(claim.confidence * 100)}%</dd>
        </div>
      </dl>

      {claim.sourceReferences && claim.sourceReferences.length > 0 && !compact && (
        <ul className="space-y-1 text-[12px]">
          {claim.sourceReferences.slice(0, 3).map((ref) => (
            <li key={ref.url}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue hover:underline"
              >
                {ref.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <a href={actionCardUrlForClaim(claim.id)} className="nt-btn nt-btn-primary !px-4 !py-2.5 !text-[13px]">
          View Action Card
        </a>
        {claim.primaryActionUrl && claim.primaryActionLabel && (
          <a
            href={claim.primaryActionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nt-btn nt-btn-ghost !px-4 !py-2.5 !text-[13px]"
          >
            {claim.primaryActionLabel}
          </a>
        )}
      </div>

      {claim.provenanceBadge && (
        <p className="text-[12px] font-bold text-success">✓ {claim.provenanceBadge}</p>
      )}
      {claim.validatorNotes && (
        <p className="text-[12px] text-muted">Validator note: {claim.validatorNotes}</p>
      )}
    </div>
  );
}
