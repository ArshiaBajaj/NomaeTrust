import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AchievementToast from "../components/detective/AchievementToast";
import DetectiveOnboarding from "../components/detective/DetectiveOnboarding";
import DetectiveResultPanel from "../components/detective/DetectiveResultPanel";
import MysteryChallengeCard from "../components/detective/MysteryChallengeCard";
import { FORENSIC_TIPS } from "../data/detectiveAchievements";
import type { AchievementId } from "../data/detectiveAchievements";
import {
  AUTO_NEXT_SECONDS,
  DETECTIVE_CHALLENGES,
  MOCK_LEADERBOARD,
  shuffleChallenges,
} from "../data/detectiveChallenges";
import type { DetectiveChallenge } from "../data/detectiveChallenges";
import { useHaptic } from "../hooks/useHaptic";
import type { AnswerResult } from "../hooks/useDetectiveProgress";
import { useDetectiveProgress } from "../hooks/useDetectiveProgress";
import { fetchDetectiveChallenges } from "../services/detectiveApi";
import { reportDetectiveCatch } from "../services/map";

type GamePhase = "play" | "result";

type RoundSnapshot = {
  challenge: DetectiveChallenge;
  correct: boolean;
  answerMeta: AnswerResult;
  swipeStamp: string | null;
};

const SHELL_BG =
  "linear-gradient(160deg, #7b93f2 0%, #9f7be8 46%, #ff8fb0 100%)";

function Flame({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#ffd36e" d="M12 2c1.2 3-1 4.2-2 6.2-.9 1.9.1 3.8 2 3.8 1 0 1.4-1.3 1.4-2.4 1.9 1.8 2.9 3.8 2.9 5.9a6.3 6.3 0 1 1-12.6 0c0-3 1.8-5 3-7 1.2 2 2.1 1.9 2.1-.1 0-2.6.2-4.4 3.2-6.3Z" />
    </svg>
  );
}
function Bulb({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path fill="#ffd36e" d="M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

export default function DetectiveMode() {
  const haptic = useHaptic();
  const { progress, xpInLevel, xpToNext, accuracy, completeOnboarding, recordAnswer } =
    useDetectiveProgress();

  const [deck, setDeck] = useState<DetectiveChallenge[]>(() =>
    shuffleChallenges(DETECTIVE_CHALLENGES),
  );
  const [deckReady, setDeckReady] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("play");
  const [snapshot, setSnapshot] = useState<RoundSnapshot | null>(null);
  const [xpPopup, setXpPopup] = useState<string | null>(null);
  const [flashRed, setFlashRed] = useState(false);
  const [pendingAchievements, setPendingAchievements] = useState<AchievementId[]>([]);
  const [autoNext, setAutoNext] = useState(AUTO_NEXT_SECONDS);

  const answeringRef = useRef(false);
  const autoNextTimerRef = useRef<number | null>(null);

  const challenge = deck[round % deck.length];
  const forensicTip = FORENSIC_TIPS[round % FORENSIC_TIPS.length];

  useEffect(() => {
    let cancelled = false;
    fetchDetectiveChallenges()
      .then(({ deck: challenges, setup }) => {
        if (cancelled || challenges.length === 0) return;
        setDeck(challenges);
        if (setup && !setup.ready) {
          console.info("[Detective] No local clips — run: npm run detective:import-sdfvd");
        }
      })
      .finally(() => {
        if (!cancelled) setDeckReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const leaderboard = useMemo(
    () =>
      MOCK_LEADERBOARD.map((row) =>
        row.isUser ? { ...row, score: progress.xp } : row,
      ).sort((a, b) => b.score - a.score),
    [progress.xp],
  );

  const clearAutoNextTimer = useCallback(() => {
    if (autoNextTimerRef.current !== null) {
      window.clearInterval(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
  }, []);

  const nextChallenge = useCallback(() => {
    clearAutoNextTimer();
    answeringRef.current = false;
    setRound((r) => r + 1);
    setPhase("play");
    setSnapshot(null);
    setAutoNext(AUTO_NEXT_SECONDS);
  }, [clearAutoNextTimer]);

  useEffect(() => {
    if (phase !== "result") {
      clearAutoNextTimer();
      return;
    }

    setAutoNext(AUTO_NEXT_SECONDS);
    let secondsLeft = AUTO_NEXT_SECONDS;

    autoNextTimerRef.current = window.setInterval(() => {
      secondsLeft -= 1;
      setAutoNext(secondsLeft);
      if (secondsLeft <= 0) {
        clearAutoNextTimer();
        nextChallenge();
      }
    }, 1000);

    return clearAutoNextTimer;
  }, [phase, nextChallenge, clearAutoNextTimer]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (answeringRef.current || phase !== "play" || !challenge) return;
      answeringRef.current = true;

      const userSaidManipulated = direction === "left";
      const correct = userSaidManipulated === challenge.isManipulated;
      const answerMeta = recordAnswer(correct, userSaidManipulated && challenge.isManipulated);

      haptic(correct ? "success" : "error");

      setFlashRed(userSaidManipulated && challenge.isManipulated);
      setXpPopup(
        answerMeta.criticalHit
          ? `Critical! +${answerMeta.xpGain} XP`
          : `+${answerMeta.xpGain} XP`,
      );

      if (answerMeta.newAchievements.length > 0) {
        setPendingAchievements(answerMeta.newAchievements);
      }

      const swipeStamp = challenge.isManipulated ? "DEEPFAKE DETECTED" : "MARKED VERIFIED";

      if (userSaidManipulated && challenge.isManipulated) {
        void reportDetectiveCatch(
          challenge.mediaLabel || challenge.artifactLabel,
          challenge.artifactLabel,
        ).catch(() => {
          /* map sync is best-effort */
        });
      }

      window.setTimeout(() => {
        setSnapshot({
          challenge,
          correct,
          answerMeta,
          swipeStamp,
        });
        setPhase("result");
        setXpPopup(null);
        setFlashRed(false);
      }, 450);
    },
    [phase, challenge, recordAnswer, haptic],
  );

  if (!progress.onboardingDone) {
    return <DetectiveOnboarding onComplete={completeOnboarding} />;
  }

  if (!challenge) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ minHeight: "100dvh", background: SHELL_BG, color: "#ffffff" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="nt-spinner" />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
            Loading challenges…
          </p>
        </div>
      </div>
    );
  }

  const displayChallenge = phase === "result" && snapshot ? snapshot.challenge : challenge;
  const xpPct = Math.max(0, Math.min(100, (xpInLevel / xpToNext) * 100));

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden"
      style={{
        minHeight: "100dvh",
        background: SHELL_BG,
        color: "#ffffff",
        paddingTop: "max(14px, env(safe-area-inset-top))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {/* alert flash on catching a deepfake */}
      {flashRed && (
        <div
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 40%, rgba(255,157,184,0.28) 0%, transparent 70%)",
            animation: "ddFlash 0.45s ease-out",
          }}
        />
      )}
      <style>{`@keyframes ddFlash{from{opacity:1}to{opacity:0}}@keyframes ddXpPop{0%{opacity:0;transform:translate(-50%,8px) scale(0.8)}30%{opacity:1;transform:translate(-50%,0) scale(1.05)}100%{opacity:0;transform:translate(-50%,-26px) scale(1)}}@keyframes ddComboGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,211,110,0)}50%{box-shadow:0 0 24px -4px rgba(255,211,110,0.6)}}`}</style>

      <AchievementToast ids={pendingAchievements} onDone={() => setPendingAchievements([])} />

      {/* top HUD */}
      <header className="flex items-center gap-3 px-4">
        <Link
          to="/home"
          aria-label="Back"
          className="nt-press flex h-10 w-10 shrink-0 items-center justify-center text-lg"
          style={{
            borderRadius: 14,
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 2px 6px rgba(50,46,77,0.04), 0 16px 36px -18px rgba(50,46,77,0.22)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          ←
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-bold" style={{ color: "#ffffff" }}>
              <span style={{ color: "#fff" }}>Lv {progress.level}</span> · Digital Detective
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.72)" }}>
              {accuracy}% accuracy
            </p>
          </div>
          <div
            className="relative mt-1.5 w-full overflow-hidden"
            style={{ height: 14, borderRadius: 999, background: "rgba(255,255,255,0.25)" }}
          >
            <div
              className="relative"
              style={{
                height: "100%",
                width: `${xpPct}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg,#8fa6f6,#b9a8f2)",
                transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <span
                style={{ position: "absolute", top: 3, left: 8, right: 8, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.5)" }}
              />
            </div>
          </div>
          <p className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.72)" }}>
            {xpInLevel}/{xpToNext} XP
          </p>
        </div>

        <div
          className="flex shrink-0 flex-col items-center"
          style={{
            borderRadius: 14,
            padding: "6px 10px",
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "saturate(160%) blur(14px)",
            WebkitBackdropFilter: "saturate(160%) blur(14px)",
          }}
        >
          <Flame />
          <span className="text-sm font-black leading-tight" style={{ color: "#fff" }}>
            {progress.dailyStreak}
          </span>
          <span className="text-[8px] uppercase tracking-wide" style={{ color: "#fff" }}>
            day
          </span>
        </div>
      </header>

      {/* combo banner */}
      {progress.sessionCombo > 1 && phase === "play" && (
        <div className="mt-3 px-4">
          <div
            className="text-center text-xs font-bold uppercase tracking-[0.12em]"
            style={{
              borderRadius: 999,
              padding: "7px 12px",
              color: "#15132b",
              background: "var(--grad-butter)",
              animation: "ddComboGlow 1.6s ease-in-out infinite",
            }}
          >
            {progress.sessionCombo}× combo — keep it going!
          </div>
        </div>
      )}

      {/* case meta */}
      <p
        className="mt-3 px-4 text-center text-[11px] uppercase tracking-[0.16em]"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        Case {progress.challengesCompleted + 1} · {displayChallenge.category} ·{" "}
        {displayChallenge.sourceContext}
      </p>

      {/* stage */}
      <main className="relative flex flex-1 flex-col items-center px-4 pt-3">
        <div className="relative w-full max-w-sm">
          {xpPopup && (
            <div
              className="pointer-events-none absolute left-1/2 top-2 z-40 -translate-x-1/2 text-lg font-black"
              style={{
                color: "#ffd36e",
                textShadow: "0 2px 12px rgba(255,255,255,0.6)",
                animation: "ddXpPop 0.9s ease-out forwards",
              }}
            >
              {xpPopup}
            </div>
          )}

          {phase === "play" && (
            <p
              className="mb-3 flex items-center justify-center gap-1.5 text-center text-[11px] leading-snug"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              <Bulb /> {forensicTip}
            </p>
          )}

          <MysteryChallengeCard
            key={round}
            challenge={displayChallenge}
            interactive={phase === "play"}
            swipeLabel={phase === "result" ? snapshot?.swipeStamp : null}
            showFakeBanner={phase === "result" && displayChallenge.isManipulated}
            onSwipe={handleSwipe}
          />

          {phase === "play" && (
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em]">
              <span style={{ color: "#ffd0dd" }}>← Manipulated</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>swipe or tap</span>
              <span style={{ color: "#c4f3e2" }}>Verified →</span>
            </div>
          )}

          {phase === "result" && snapshot && (
            <div className="mt-4">
              <DetectiveResultPanel
                challenge={snapshot.challenge}
                correct={snapshot.correct}
                answerMeta={snapshot.answerMeta}
                autoNextSeconds={autoNext}
                onNext={nextChallenge}
              />
            </div>
          )}
        </div>
      </main>

      {/* footer */}
      <footer className="px-4 pt-3">
        <div className="mx-auto w-full max-w-sm">
          {phase === "play" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSwipe("left")}
                className="nt-btn-3d nt-btn-3d--pink nt-btn-3d--block"
              >
                ✕ Fake
              </button>
              <button
                type="button"
                onClick={() => handleSwipe("right")}
                className="nt-btn-3d nt-btn-3d--green nt-btn-3d--block"
              >
                ✓ Real
              </button>
            </div>
          )}

          {phase === "result" && (
            <div
              style={{
                borderRadius: 18,
                padding: "12px 14px",
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "saturate(160%) blur(14px)",
                WebkitBackdropFilter: "saturate(160%) blur(14px)",
                boxShadow: "0 2px 6px rgba(50,46,77,0.04), 0 16px 36px -18px rgba(50,46,77,0.22)",
              }}
            >
              <p
                className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#fff" }}
              >
                This week&apos;s detectives
              </p>
              <ul className="flex flex-col gap-1.5">
                {leaderboard.slice(0, 3).map((row, i) => (
                  <li
                    key={row.name}
                    className="flex items-center gap-2 text-[13px]"
                    style={{
                      color: row.isUser ? "#ffd36e" : "rgba(255,255,255,0.85)",
                      fontWeight: row.isUser ? 800 : 500,
                    }}
                  >
                    <span style={{ width: 20, color: "rgba(255,255,255,0.55)" }}>#{i + 1}</span>
                    <span className="flex-1 truncate">{row.name}</span>
                    <span>{row.score.toLocaleString()} XP</span>
                  </li>
                ))}
              </ul>
              {progress.achievements.length > 0 && (
                <p
                  className="mt-2 text-[11px]"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {progress.achievements.length} badge
                  {progress.achievements.length === 1 ? "" : "s"} earned
                </p>
              )}
            </div>
          )}

          <p
            className="mt-3 text-center text-[10px]"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {!deckReady
              ? "Loading challenge deck…"
              : `${deck.length} video cases · SDFVD deepfake dataset`}
          </p>
        </div>
      </footer>
    </div>
  );
}
