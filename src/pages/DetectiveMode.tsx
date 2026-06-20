import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { homeForAudience } from "../config/navigation";
import { useAudience } from "../context/AudienceContext";
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
import { useIsMobile } from "../hooks/useIsMobile";
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

export default function DetectiveMode() {
  const isMobile = useIsMobile();
  const { audience } = useAudience();
  const backTo = homeForAudience(audience);
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
    [phase, challenge, recordAnswer],
  );

  if (!progress.onboardingDone) {
    return (
      <div className="detective-shell">
        <DetectiveOnboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="detective-shell">
        <p className="detective-demo-note">Loading challenges…</p>
      </div>
    );
  }

  const displayChallenge = phase === "result" && snapshot ? snapshot.challenge : challenge;

  return (
    <div className={`detective-shell ${flashRed ? "detective-shell--alert" : ""}`}>
      <header className="detective-topbar">
        <Link to={backTo} className="detective-back" aria-label="Back">
          ←
        </Link>
        <div className="detective-profile">
          <div className="detective-avatar">🕵️</div>
          <div>
            <p className="detective-profile-name">Digital Detective</p>
            <div className="detective-xp-bar">
              <div
                className="detective-xp-fill"
                style={{ width: `${(xpInLevel / xpToNext) * 100}%` }}
              />
            </div>
            <p className="detective-xp-text">
              Lv {progress.level} · {xpInLevel}/{xpToNext} XP · {accuracy}% accuracy
            </p>
          </div>
        </div>
        <div className="detective-streak">
          <span className="detective-streak-flame">🔥</span>
          <span className="detective-streak-count">{progress.dailyStreak}</span>
          <span className="detective-streak-label">Day streak</span>
        </div>
      </header>

      {progress.sessionCombo > 1 && phase === "play" && (
        <div className="detective-combo-bar">
          {progress.sessionCombo}× COMBO — keep it going!
        </div>
      )}

      <p className="detective-mission">
        Case {progress.challengesCompleted + 1} · {displayChallenge.category} ·{" "}
        {displayChallenge.sourceContext}
      </p>

      <div className="detective-stage">
        {xpPopup && <div className="detective-xp-popup">{xpPopup}</div>}

        <AchievementToast
          ids={pendingAchievements}
          onDone={() => setPendingAchievements([])}
        />

        {phase === "play" && (
          <p className="detective-forensic-tip">
            <span>💡</span> {forensicTip}
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
          <>
            <p className="detective-swipe-hint detective-swipe-hint--left">
              ← SWIPE · Manipulated
            </p>
            <p className="detective-swipe-hint detective-swipe-hint--right">
              Verified · SWIPE →
            </p>
            {isMobile && (
              <p className="detective-swipe-only">Swipe the card — or use the buttons below</p>
            )}
          </>
        )}

        {phase === "result" && snapshot && (
          <DetectiveResultPanel
            challenge={snapshot.challenge}
            correct={snapshot.correct}
            answerMeta={snapshot.answerMeta}
            autoNextSeconds={autoNext}
            onNext={nextChallenge}
          />
        )}
      </div>

      <footer className="detective-footer">
        {phase === "play" && (
          <div className="detective-actions">
            <button
              type="button"
              className="detective-btn detective-btn--fake"
              onClick={() => handleSwipe("left")}
            >
              MANIPULATED
            </button>
            <button
              type="button"
              className="detective-btn detective-btn--real"
              onClick={() => handleSwipe("right")}
            >
              VERIFIED
            </button>
          </div>
        )}

        {phase === "result" && (
          <div className="detective-leaderboard">
            <p className="detective-leaderboard-title">This week&apos;s detectives</p>
            <ul>
              {leaderboard.slice(0, 3).map((row, i) => (
                <li key={row.name} className={row.isUser ? "detective-leaderboard-you" : ""}>
                  <span>#{i + 1}</span>
                  <span>{row.name}</span>
                  <span>{row.score.toLocaleString()} XP</span>
                </li>
              ))}
            </ul>
            {progress.achievements.length > 0 && (
              <p className="detective-badge-count">
                {progress.achievements.length} badge
                {progress.achievements.length === 1 ? "" : "s"} earned
              </p>
            )}
          </div>
        )}
      </footer>

      <p className="detective-demo-note">
        {!deckReady
          ? "Loading challenge deck…"
          : `${deck.length} video cases · SDFVD deepfake dataset`}
      </p>
    </div>
  );
}
