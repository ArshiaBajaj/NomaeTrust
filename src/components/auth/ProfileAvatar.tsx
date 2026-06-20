import { useRef } from "react";

type ProfileAvatarProps = {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onPhotoSelect?: (dataUrl: string) => void;
};

const SIZES = {
  sm: 28,
  md: 56,
  lg: 88,
} as const;

export default function ProfileAvatar({
  name,
  avatarUrl,
  size = "md",
  editable = false,
  onPhotoSelect,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const px = SIZES[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  const handleFile = (file: File | undefined) => {
    if (!file || !onPhotoSelect) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPhotoSelect(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const inner = avatarUrl ? (
    <img src={avatarUrl} alt="" className="profile-avatar-img" />
  ) : (
    <span className="profile-avatar-initial">{initial}</span>
  );

  if (!editable) {
    return (
      <div
        className={`profile-avatar profile-avatar--${size}`}
        style={{ width: px, height: px }}
        aria-hidden
      >
        {inner}
      </div>
    );
  }

  return (
    <div className="profile-avatar-wrap">
      <button
        type="button"
        className={`profile-avatar profile-avatar--${size} profile-avatar--editable`}
        style={{ width: px, height: px }}
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile photo"
      >
        {inner}
        <span className="profile-avatar-badge">📷</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
