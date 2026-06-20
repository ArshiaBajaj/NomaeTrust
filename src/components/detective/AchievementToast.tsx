import { useEffect } from "react";
import { ACHIEVEMENTS, type AchievementId } from "../../data/detectiveAchievements";
import { useHaptic } from "../../hooks/useHaptic";

type AchievementToastProps = {
  ids: AchievementId[];
  onDone: () => void;
};

export default function AchievementToast({ ids, onDone }: AchievementToastProps) {
  const haptic = useHaptic();

  useEffect(() => {
    if (ids.length === 0) return;
    haptic("success");
    const t = window.setTimeout(onDone, 3600);
    return () => window.clearTimeout(t);
  }, [ids, onDone, haptic]);

  if (ids.length === 0) return null;

  const achievement = ACHIEVEMENTS[ids[0]];

  return (
    <div
      role="status"
      className="pointer-events-none fixed left-1/2 z-50 flex w-[min(92vw,360px)] -translate-x-1/2 items-center gap-3"
      style={{
        top: "max(18px, env(safe-area-inset-top))",
        borderRadius: 20,
        padding: "12px 14px",
        background: "rgba(29,24,56,0.92)",
        border: "1px solid rgba(255,211,110,0.45)",
        boxShadow: "0 22px 60px -24px rgba(0,0,0,0.9)",
        backdropFilter: "blur(16px)",
        animation: "ddToastIn 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <style>{`@keyframes ddToastIn{from{opacity:0;transform:translate(-50%,-16px) scale(0.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}`}</style>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl"
        style={{
          borderRadius: 14,
          background: "var(--grad-butter)",
          boxShadow: "0 10px 24px -10px rgba(255,211,110,0.8)",
        }}
      >
        {achievement.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#ffd36e" }}
        >
          Badge unlocked
        </p>
        <p className="truncate text-sm font-bold" style={{ color: "#eef0ff" }}>
          {achievement.title}
        </p>
        <p
          className="truncate text-xs"
          style={{ color: "rgba(238,240,255,0.6)" }}
        >
          {achievement.description}
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="pointer-events-auto flex h-7 w-7 shrink-0 items-center justify-center text-sm font-bold"
        style={{
          borderRadius: 999,
          border: "none",
          color: "#15132b",
          background: "#ffd36e",
        }}
        aria-label="Dismiss"
      >
        ✓
      </button>
    </div>
  );
}
