import { useEffect, useRef, type MutableRefObject } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Claim, MapHotspot } from "../types";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

type ConfusionMapProps = {
  claims: Claim[];
  hotspots?: MapHotspot[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showHeat?: boolean;
  fitBoundsKey?: string;
};

const STATUS_COLOR: Record<Claim["status"], string> = {
  verified: "#16a34a",
  unverified: "#dc2626",
  disputed: "#f59e0b",
  pending: "#2b5ce6",
};

const STATUS_LABEL: Record<Claim["status"], string> = {
  verified: "Verified",
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
      ${badge}
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
      marker.bindPopup(popupHtml(claim), { maxWidth: 280 });
      marker.on("click", () => onSelect?.(claim.id));
      markersRef.current.set(claim.id, marker);
      group.addLayer(marker);
    }

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      markersRef.current.clear();
    };
  }, [claims, selectedId, map, onSelect, markersRef]);

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
  }, [claim, map, markersRef]);

  return null;
}

function FitBoundsToClaims({
  claims,
  fitBoundsKey,
}: {
  claims: Claim[];
  fitBoundsKey?: string;
}) {
  const map = useMap();

  useEffect(() => {
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

    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 13 });
  }, [claims, fitBoundsKey, map]);

  return null;
}

function HotspotLayer({ hotspots }: { hotspots: MapHotspot[] }) {
  return (
    <>
      {hotspots
        .filter((h) => h.unverifiedCount > 0)
        .map((hotspot) => (
          <Circle
            key={`hotspot-${hotspot.id}`}
            center={[hotspot.lat, hotspot.lng]}
            radius={600 + hotspot.unverifiedCount * 180}
            pathOptions={{
              color: hotspot.intensity > 0.6 ? "#dc2626" : "#f59e0b",
              fillColor: hotspot.intensity > 0.6 ? "#dc2626" : "#f59e0b",
              fillOpacity: 0.06 + hotspot.intensity * 0.08,
              weight: 1.5,
              opacity: 0.35,
            }}
          />
        ))}
    </>
  );
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
  selectedId,
  onSelect,
  showHeat = true,
  fitBoundsKey,
}: ConfusionMapProps) {
  const located = claims.filter((c) => c.location);
  const center = computeCenter(located);
  const selectedClaim = claims.find((c) => c.id === selectedId) ?? null;
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  return (
    <div className="confusion-map-frame relative h-[min(520px,65vh)] w-full overflow-hidden rounded-xl border border-[rgba(0,0,0,0.07)] shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      {located.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/70">
          <p className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-text-muted shadow-sm">
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

        {showHeat && hotspots.length > 0 && <HotspotLayer hotspots={hotspots} />}

        {showHeat &&
          located
            .filter((c) => c.status !== "verified")
            .map((claim) => (
              <Circle
                key={`heat-${claim.id}`}
                center={[claim.location!.lat, claim.location!.lng]}
                radius={claim.urgentReview ? 420 : 280}
                pathOptions={{
                  color: claim.urgentReview ? "#dc2626" : "#f59e0b",
                  fillColor: claim.urgentReview ? "#dc2626" : "#f59e0b",
                  fillOpacity: 0.08,
                  weight: 1,
                  opacity: 0.25,
                }}
              />
            ))}

        <FitBoundsToClaims claims={located} fitBoundsKey={fitBoundsKey} />
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

export function MapLegend({ showHotspots = true }: { showHotspots?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
      <span className="font-semibold uppercase tracking-wide text-text-body">Legend</span>
      {(
        [
          ["verified", "Verified", "#16a34a"],
          ["pending", "Pending", "#2b5ce6"],
          ["unverified", "Unverified", "#dc2626"],
          ["disputed", "Disputed", "#f59e0b"],
        ] as const
      ).map(([, label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ background: color }}
          />
          {label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="claim-pin claim-pin--urgent inline-block h-2.5 w-2.5 rounded-full bg-secondary" />
        Urgent pulse
      </span>
      {showHotspots && (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-amber-500/40 bg-amber-500/15" />
          Neighborhood confusion zone
        </span>
      )}
    </div>
  );
}

export function ClaimMapDetail({ claim }: { claim: Claim }) {
  return (
    <div className="border-t border-[rgba(0,0,0,0.06)] bg-surface-raised p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
        Selected rumor
      </p>
      <p className="mt-2 text-sm font-semibold leading-snug text-navy">{claim.text}</p>
      <dl className="mt-3 grid gap-1.5 text-xs text-text-muted">
        <div className="flex justify-between gap-2">
          <dt>Status</dt>
          <dd className="capitalize text-text-body">{claim.status}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Source</dt>
          <dd className="capitalize text-text-body">{claim.source}</dd>
        </div>
        {claim.location && (
          <div className="flex justify-between gap-2">
            <dt>Area</dt>
            <dd className="text-text-body">{claim.location.label}</dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt>Confidence</dt>
          <dd className="text-text-body">{Math.round(claim.confidence * 100)}%</dd>
        </div>
      </dl>
      {claim.provenanceBadge && (
        <p className="mt-3 text-xs font-semibold text-success">✓ {claim.provenanceBadge}</p>
      )}
    </div>
  );
}
