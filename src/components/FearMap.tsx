import { MapContainer, Marker, Popup, TileLayer, CircleMarker } from "react-leaflet";
import type { MapHotspot } from "../types";
import "leaflet/dist/leaflet.css";

type FearMapProps = {
  hotspots: MapHotspot[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

function intensityColor(intensity: number): string {
  if (intensity >= 0.7) return "#dc2626";
  if (intensity >= 0.4) return "#f59e0b";
  return "#2b5ce6";
}

export default function FearMap({ hotspots, selectedId, onSelect }: FearMapProps) {
  const center =
    hotspots.length > 0
      ? { lat: hotspots[0].lat, lng: hotspots[0].lng }
      : { lat: 33.749, lng: -84.388 };

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-[rgba(0,0,0,0.07)]">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((hotspot) => {
          const radius = 12 + hotspot.unverifiedCount * 4;
          const color = intensityColor(hotspot.intensity);
          const isSelected = selectedId === hotspot.id;

          return (
            <CircleMarker
              key={hotspot.id}
              center={[hotspot.lat, hotspot.lng]}
              radius={Math.min(radius, 36)}
              pathOptions={{
                color: isSelected ? "#0f1b3c" : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.85 : 0.55,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelect?.(hotspot.id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{hotspot.label}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {hotspot.claimCount} claims · {hotspot.unverifiedCount} unverified
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        <Marker position={[33.749, -84.388]}>
          <Popup>Atlanta community hub</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
