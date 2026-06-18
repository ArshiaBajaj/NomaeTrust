import type { ProvenanceEvent } from "../../types/contextLens";

type ThumbnailPlaceholderProps = {
  variant?: ProvenanceEvent["thumbnailVariant"];
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  badge?: "verified" | "disputed" | "none";
};

const SIZE = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-36 w-full",
};

export default function ThumbnailPlaceholder({
  variant = "protest",
  imageUrl,
  size = "md",
  selected = false,
  badge,
}: ThumbnailPlaceholderProps) {
  const isFlood = variant === "flood";
  const showVerified = badge === "verified" || (badge === undefined && isFlood);
  const showDisputed = badge === "disputed" || (badge === undefined && !isFlood);

  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg border-2 ${
          selected ? "border-accent ring-2 ring-accent/25" : "border-[rgba(0,0,0,0.08)]"
        } ${SIZE[size]} ${size === "lg" ? "aspect-[16/10]" : ""}`}
      >
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        {showDisputed && (
          <div className="absolute left-1 top-1 rounded bg-secondary/90 px-1 py-0.5 text-[7px] font-bold uppercase text-white">
            Disputed
          </div>
        )}
        {showVerified && (
          <div className="absolute right-1 top-1 rounded bg-success/90 px-1 py-0.5 text-[7px] font-bold uppercase text-white">
            Verified
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 ${
        selected ? "border-accent ring-2 ring-accent/25" : "border-[rgba(0,0,0,0.08)]"
      } ${SIZE[size]} ${size === "lg" ? "aspect-[16/10]" : ""}`}
    >
      <div
        className={`absolute inset-0 ${
          isFlood
            ? "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700"
            : "bg-gradient-to-br from-orange-400 via-red-500 to-slate-800"
        }`}
      />
      {showDisputed && (
        <div className="absolute left-1 top-1 rounded bg-secondary/90 px-1 py-0.5 text-[7px] font-bold uppercase text-white">
          Disputed
        </div>
      )}
      {showVerified && (
        <div className="absolute right-1 top-1 rounded bg-success/90 px-1 py-0.5 text-[7px] font-bold uppercase text-white">
          Verified
        </div>
      )}
    </div>
  );
}
