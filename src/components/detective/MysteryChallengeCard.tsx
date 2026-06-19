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

function TrackingOverlay({ region }: { region: DetectiveChallenge["highlightRegion"] }) {
  return (
    <>
      {(region === "eyes" || region === "mouth") && (
        <>
          <div className="detective-track detective-track--eyes" aria-hidden />
          <div className="detective-track detective-track--mouth" aria-hidden />
        </>
      )}
      {region === "audio" && (
        <div className="detective-waveform" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ height: `${20 + ((i * 7) % 60)}%` }} />
          ))}
        </div>
      )}
      {region === "lighting" && (
        <div className="detective-lighting-hint" aria-hidden />
      )}
    </>
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

  const style = interactive
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.rot}deg)`,
        transition: dragging.current
          ? "none"
          : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }
    : undefined;

  const fakeOpacity = Math.min(1, Math.max(0, -drag.x / SWIPE_THRESHOLD));
  const realOpacity = Math.min(1, Math.max(0, drag.x / SWIPE_THRESHOLD));

  const showVideo = Boolean(challenge.videoUrl) && !videoFailed;

  return (
    <div
      ref={cardRef}
      className={`detective-card ${interactive ? "" : "detective-card--frozen"} ${
        committed.current ? "detective-card--exit" : ""
      }`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={resetDrag}
    >
      {interactive && !committed.current && (
        <>
          <div
            className="detective-drag-label detective-drag-label--fake"
            style={{ opacity: fakeOpacity }}
          >
            FAKE
          </div>
          <div
            className="detective-drag-label detective-drag-label--real"
            style={{ opacity: realOpacity }}
          >
            REAL
          </div>
        </>
      )}
      {swipeLabel && (
        <div
          className={`detective-stamp ${
            swipeLabel.includes("DEEPFAKE") ? "detective-stamp--fake" : "detective-stamp--verified"
          }`}
        >
          {swipeLabel}
        </div>
      )}

      {showFakeBanner && <div className="detective-fake-banner">DETECTED AS FAKE</div>}

      <div className="detective-card-media">
        {showVideo ? (
          <video
            ref={videoRef}
            src={challenge.videoUrl}
            className="detective-card-video"
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
            className="detective-card-img"
            draggable={false}
          />
        )}
        <TrackingOverlay region={challenge.highlightRegion} />
        {showVideo && <span className="detective-video-badge">▶ CLIP</span>}
        <span className="detective-category-tag">{challenge.category}</span>
        <span className="detective-media-tag">{challenge.mediaLabel}</span>
      </div>

      <p className="detective-card-prompt">{challenge.prompt}</p>
    </div>
  );
}
