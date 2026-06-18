import exifr from "exifr";

export type ExtractedExif = {
  gps: string;
  captured: string;
  published: string;
  device?: string;
  rawDate?: string;
  latitude?: number;
  longitude?: number;
};

function formatGps(lat?: number, lng?: number): string {
  if (lat == null || lng == null) return "Not embedded in file";
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

function formatDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function extractExifMetadata(
  buffer: Buffer,
): Promise<ExtractedExif | null> {
  try {
    const data = await exifr.parse(buffer, { gps: true, reviveValues: true });

    if (!data || typeof data !== "object") return null;

    const latitude = typeof data.latitude === "number" ? data.latitude : undefined;
    const longitude = typeof data.longitude === "number" ? data.longitude : undefined;

    const captured =
      formatDate(data.DateTimeOriginal) ??
      formatDate(data.CreateDate) ??
      formatDate(data.ModifyDate) ??
      "Not embedded in file";

    const device = [data.Make, data.Model].filter(Boolean).join(" ").trim() || undefined;

    const published =
      formatDate(data.DateTime) ??
      formatDate(data.MetadataDate) ??
      captured;

    return {
      gps: formatGps(latitude, longitude),
      captured,
      published,
      device,
      rawDate: typeof captured === "string" ? captured : undefined,
      latitude,
      longitude,
    };
  } catch {
    return null;
  }
}

export function exifToDisplay(exif: ExtractedExif | null): ExtractedExif {
  if (exif) return exif;
  return {
    gps: "Not embedded — likely stripped on re-upload",
    captured: "Unknown — EXIF removed",
    published: "Unknown — EXIF removed",
    device: "Screenshot or social re-upload",
  };
}
