import { useEffect } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Claim } from "../types";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

type ConfusionMapProps = {
  claims: Claim[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showHeat?: boolean;
};

const STATUS_COLOR: Record<Claim["status"], string> = {
  verified: "#16a34a",
  unverified: "#dc2626",
  disputed: "#f59e0b",
  pending: "#2b5ce6",
};

const SOURCE_LABEL: Record<Claim["source"], string> = {
  voice: "Voice note",
  screenshot: "Screenshot",
  call: "Phone call",
  community: "Community report",
  deepfake: "Synthetic media",
};

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
  const loc = claim.location?.label ?? "Atlanta area";
  const badge = claim.provenanceBadge
    ? `<p style="margin:6px 0 0;font-size:11px;color:#16a34a">✓ ${claim.provenanceBadge}</p>`
    : "";
  const urgent = claim.urgentReview
    ? `<span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:999px;background:#fef2f2;color:#dc2626;font-size:10px;font-weight:600">URGENT</span>`
    : "";

  return `
    <div style="min-width:200px;max-width:260px;font-family:system-ui,sans-serif">
      <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b">
        ${SOURCE_LABEL[claim.source]}${claim.category ? ` · ${claim.category}` : ""}
      </p>
      <p style="margin:6px 0 0;font-size:13px;font-weight:600;line-height:1.4;color:#0f172a">${claim.text}</p>
      <p style="margin:8px 0 0;font-size:11px;color:#64748b">${loc} · ${conf}% confidence</p>
      <p style="margin:4px 0 0;font-size:10px;color:#94a3b8">${time}</p>
      ${urgent}
      ${badge}
    </div>
  `;
}

function ClaimClusterLayer({
  claims,
  selectedId,
  onSelect,
}: {
  claims: Claim[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
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
      group.addLayer(marker);
    }

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [claims, selectedId, map, onSelect]);

  return null;
}

function FlyToClaim({ claim }: { claim?: Claim | null }) {
  const map = useMap();

  useEffect(() => {
    if (claim?.location) {
      map.flyTo([claim.location.lat, claim.location.lng], 14, { duration: 0.8 });
    }
  }, [claim, map]);

  return null;
}

export default function ConfusionMap({
  claims,
  selectedId,
  onSelect,
  showHeat = true,
}: ConfusionMapProps) {
  const located = claims.filter((c) => c.location);
  const center =
    located.length > 0
      ? { lat: located[0].location!.lat, lng: located[0].location!.lng }
      : { lat: 33.749, lng: -84.388 };

  const selectedClaim = claims.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="confusion-map-frame h-[min(520px,65vh)] w-full overflow-hidden rounded-xl border border-[rgba(0,0,0,0.07)] shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
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

        <ClaimClusterLayer
          claims={located}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <FlyToClaim claim={selectedClaim} />
      </MapContainer>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
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
    </div>
  );
}
