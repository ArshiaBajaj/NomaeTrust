import { useCallback, useEffect, useRef, useState } from "react";
import type { DetectiveChallenge } from "../../data/detectiveChallenges";

type SwipeDirection = "left" | "right";

type MysteryChallengeCardProps = {
  challenge: DetectiveChallenge;
  interactive: boolean;
  swipeLabel?: string | null;
  showFakeBanner?: boolean;
  onSwipe: (direction: SwipeDirection) => void;
};

const SWIPE_THRESHOLD = 90;

const CATEGORY_TINT: Record<DetectiveChallenge["category"], string> = {
  Politics: "#8fa6f6",
  News: "#8fe3c6",
  Health: "#ff9db8",
  Crisis: "#ffd36e",
  Social: "#b9a8f2",
};

function TrackingOverlay({ region }: { region: DetectiveChallenge["highlightRegion"] }) {
  if (region === "audio") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-6 flex h-14 items-end justify-between gap-[3px]"
      >
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: `${20 + ((i * 7) % 60)}%`,
              borderRadius: 999,
              background: "rgba(143,227,198,0.75)",
              boxShadow: "0 0 8px rgba(143,227,198,0.5)",
            }}
          />
        ))}
      </div>
    );
  }

  if (region === "lighting") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 38% 38%, rgba(255,211,110,0.28) 0%, transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
    );
  }

  // eyes / mouth — animated forensic reticles
  const boxes =
    region === "eyes"
      ? [{ top: "30%", left: "34%" }, { top: "30%", left: "54%" }]
      : [{ top: "58%", left: "42%" }];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {boxes.map((b, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            width: 56,
            height: region === "eyes" ? 30 : 26,
            borderRadius: 10,
            border: "2px solid rgba(255,157,184,0.9)",
            boxShadow: "0 0 14px rgba(255,157,184,0.55)",
            animation: "ddPulse 1.6s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

export default function MysteryChallengeCard({
  challenge,
  interactive,
  swipeLabel,
  showFakeBanner,
  onSwipe,
}: MysteryChallengeCardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, rot: 0 });
  const [videoFailed, setVideoFailed] = useState(false);
  const dragRef = useRef({ x: 0, y: 0, rot: 0 });
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const committed = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const resetDrag = useCallback(() => {
    dragRef.current = { x: 0, y: 0, rot: 0 };
    setDrag(dragRef.current);
    startRef.current = null;
    dragging.current = false;
  }, []);

  useEffect(() => {
    committed.current = false;
    setVideoFailed(false);
    resetDrag();
  }, [challenge.id, resetDrag]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !challenge.videoUrl || videoFailed) return;

    video.load();
    const play = () => {
      void video.play().catch(() => {
        /* autoplay blocked until interaction — still show first frame */
      });
    };
    if (video.readyState >= 2) {
      play();
    } else {
      video.addEventListener("loadeddata", play, { once: true });
      return () => video.removeEventListener("loadeddata", play);
    }
  }, [challenge.id, challenge.videoUrl, videoFailed]);

  const commitSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!interactive || committed.current) return;
      committed.current = true;
      dragging.current = false;

      const exitX = direction === "left" ? -420 : 420;
      const exitY = direction === "left" ? -120 : -80;
      dragRef.current = {
        x: exitX,
        y: exitY,
        rot: direction === "left" ? -18 : 18,
      };
      setDrag(dragRef.current);
      window.setTimeout(() => onSwipe(direction), 280);
    },
    [interactive, onSwipe],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive || committed.current) return;
    dragging.current = true;
    startRef.current = { x: e.clientX, y: e.clientY };
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !startRef.current || !interactive || committed.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    dragRef.current = { x: dx, y: dy * 0.35, rot: dx * 0.04 };
    setDrag(dragRef.current);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current || !interactive || committed.current) return;
    dragging.current = false;
    cardRef.current?.releasePointerCapture(e.pointerId);

    const dx = dragRef.current.x;
    if (dx <= -SWIPE_THRESHOLD) {
      commitSwipe("left");
      return;
    }
    if (dx >= SWIPE_THRESHOLD) {
      commitSwipe("right");
      return;
    }
    resetDrag();
  };

  const style: React.CSSProperties = interactive
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.rot}deg)`,
        transition: dragging.current
          ? "none"
          : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        touchAction: "none",
        cursor: dragging.current ? "grabbing" : "grab",
      }
    : {};

  const fakeOpacity = Math.min(1, Math.max(0, -drag.x / SWIPE_THRESHOLD));
  const realOpacity = Math.min(1, Math.max(0, drag.x / SWIPE_THRESHOLD));
  const tilt = interactive ? Math.max(-1, Math.min(1, drag.x / 160)) : 0;

  const showVideo = Boolean(challenge.videoUrl) && !videoFailed;
  const tint = CATEGORY_TINT[challenge.category];

  return (
    <div
      ref={cardRef}
      className="relative flex w-full flex-col overflow-hidden select-none"
      style={{
        ...style,
        borderRadius: 28,
        background: "rgba(255,255,255,0.16)",
        border: "1px solid rgba(255,255,255,0.3)",
        backdropFilter: "saturate(160%) blur(14px)",
        WebkitBackdropFilter: "saturate(160%) blur(14px)",
        boxShadow: `0 18px 40px -20px rgba(50,46,77,0.35)`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={resetDrag}
    >
      <style>{`@keyframes ddPulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>

      {/* directional glow while dragging */}
      {interactive && !committed.current && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              borderRadius: 28,
              background:
                "linear-gradient(90deg, rgba(255,157,184,0.32) 0%, transparent 45%)",
              opacity: fakeOpacity * 0.9,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              borderRadius: 28,
              background:
                "linear-gradient(270deg, rgba(143,227,198,0.32) 0%, transparent 45%)",
              opacity: realOpacity * 0.9,
            }}
          />
          <div
            className="pointer-events-none absolute left-4 top-4 z-30"
            style={{
              opacity: fakeOpacity,
              transform: `rotate(-12deg) scale(${0.9 + fakeOpacity * 0.25})`,
              padding: "8px 16px",
              borderRadius: 12,
              border: "3px solid #e0556f",
              color: "#e0556f",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: "0.08em",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(4px)",
            }}
          >
            FAKE
          </div>
          <div
            className="pointer-events-none absolute right-4 top-4 z-30"
            style={{
              opacity: realOpacity,
              transform: `rotate(12deg) scale(${0.9 + realOpacity * 0.25})`,
              padding: "8px 16px",
              borderRadius: 12,
              border: "3px solid #2f9e6e",
              color: "#2f9e6e",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: "0.08em",
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(4px)",
            }}
          >
            REAL
          </div>
        </>
      )}

      {/* result stamp */}
      {swipeLabel && (
        <div
          className="pointer-events-none absolute left-1/2 top-7 z-30 -translate-x-1/2 whitespace-nowrap"
          style={{
            transform: "translateX(-50%) rotate(-8deg)",
            padding: "10px 20px",
            borderRadius: 14,
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: "0.08em",
            border: `3px solid ${swipeLabel.includes("DEEPFAKE") ? "#e0556f" : "#2f9e6e"}`,
            color: swipeLabel.includes("DEEPFAKE") ? "#e0556f" : "#2f9e6e",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(4px)",
          }}
        >
          {swipeLabel}
        </div>
      )}

      {showFakeBanner && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 py-2 text-center text-xs font-bold uppercase tracking-[0.2em]"
          style={{ background: "var(--grad-pink)", color: "#7a2740" }}
        >
          Detected as fake
        </div>
      )}

      {/* media */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "3 / 4", background: "#0c0a16" }}
      >
        {showVideo ? (
          <video
            ref={videoRef}
            src={challenge.videoUrl}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: `scale(1.04) rotate(${tilt * 0.6}deg)` }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            draggable={false}
            onError={() => setVideoFailed(true)}
            onLoadedData={() => setVideoFailed(false)}
          />
        ) : (
          <img
            src={challenge.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        )}

        <TrackingOverlay region={challenge.highlightRegion} />

        {/* readability gradient */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(12,10,22,0.85) 100%)",
          }}
        />

        {/* tags */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{
              padding: "5px 10px",
              borderRadius: 999,
              color: "#15132b",
              background: tint,
              boxShadow: `0 6px 16px -8px ${tint}`,
            }}
          >
            {challenge.category}
          </span>
          {showVideo && (
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                color: "#eef0ff",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              ▶ Clip
            </span>
          )}
        </div>

        <span
          className="absolute bottom-3 left-3 z-10 max-w-[80%] truncate text-[11px] font-medium"
          style={{ color: "rgba(238,240,255,0.85)" }}
        >
          {challenge.mediaLabel}
        </span>
      </div>

      {/* prompt */}
      <p
        className="px-5 py-4 text-[15px] font-semibold leading-snug"
        style={{ color: "#fff" }}
      >
        {challenge.prompt}
      </p>
    </div>
  );
}
