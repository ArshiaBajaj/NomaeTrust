import { useCallback, useEffect, useState } from "react";
import type { AchievementId } from "../data/detectiveAchievements";
import { XP_CORRECT_BASE, XP_PER_LEVEL, XP_WRONG, STREAK_FREEZES_PER_WEEK } from "../data/detectiveChallenges";

const STORAGE_KEY = "nomae-detective-progress-v2";

export type DetectiveProgress = {
  xp: number;
  level: number;
  sessionCombo: number;
  bestCombo: number;
  dailyStreak: number;
  bestDailyStreak: number;
  lastPlayedDate: string | null;
  streakFreezes: number;
  freezeWeekKey: string | null;
  totalCorrect: number;
  manipulatedCaught: number;
  challengesCompleted: number;
  achievements: AchievementId[];
  onboardingDone: boolean;
};

export type AnswerResult = {
  xpGain: number;
  combo: number;
  comboMultiplier: number;
  criticalHit: boolean;
  leveledUp: boolean;
  newAchievements: AchievementId[];
  dailyStreak: number;
};

const FRESH: DetectiveProgress = {
  xp: 0,
  level: 1,
  sessionCombo: 0,
  bestCombo: 0,
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastPlayedDate: null,
  streakFreezes: 1,
  freezeWeekKey: null,
  totalCorrect: 0,
  manipulatedCaught: 0,
  challengesCompleted: 0,
  achievements: [],
  onboardingDone: false,
};

function weekKey(date = new Date()): string {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function loadProgress(): DetectiveProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return FRESH;
    return { ...FRESH, ...JSON.parse(raw) } as DetectiveProgress;
  } catch {
    return FRESH;
  }
}

function saveProgress(progress: DetectiveProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function refreshWeeklyFreeze(prev: DetectiveProgress): DetectiveProgress {
  const key = weekKey();
  if (prev.freezeWeekKey === key) return prev;
  return {
    ...prev,
    freezeWeekKey: key,
    streakFreezes: STREAK_FREEZES_PER_WEEK,
  };
}

function updateDailyStreak(prev: DetectiveProgress): DetectiveProgress {
  const today = dayKey();
  if (prev.lastPlayedDate === today) return prev;

  const yesterday = yesterdayKey();
  let dailyStreak = prev.dailyStreak;

  if (prev.lastPlayedDate === yesterday) {
    dailyStreak += 1;
  } else if (prev.lastPlayedDate === null) {
    dailyStreak = 1;
  } else {
    dailyStreak = 1;
  }

  return {
    ...prev,
    dailyStreak,
    bestDailyStreak: Math.max(prev.bestDailyStreak, dailyStreak),
    lastPlayedDate: today,
  };
}

function checkAchievements(progress: DetectiveProgress, correct: boolean): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const has = (id: AchievementId) => progress.achievements.includes(id);
  const add = (id: AchievementId) => {
    if (!has(id) && !unlocked.includes(id)) unlocked.push(id);
  };

  if (correct && progress.totalCorrect >= 1) add("first_case");
  if (correct && progress.sessionCombo >= 3) add("combo_3");
  if (correct && progress.sessionCombo >= 5) add("combo_5");
  if (progress.dailyStreak >= 3) add("daily_3");
  if (progress.manipulatedCaught >= 5) add("deepfake_hunter");

  if (progress.challengesCompleted >= 10) {
    const rate = progress.totalCorrect / progress.challengesCompleted;
    if (rate >= 0.8) add("sharp_eye");
  }

  return unlocked;
}

export function useDetectiveProgress() {
  const [progress, setProgress] = useState<DetectiveProgress>(() =>
    refreshWeeklyFreeze(loadProgress()),
  );

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const completeOnboarding = useCallback(() => {
    setProgress((prev) => ({ ...prev, onboardingDone: true }));
  }, []);

  const recordAnswer = useCallback(
    (correct: boolean, caughtManipulated: boolean): AnswerResult => {
      let answerResult!: AnswerResult;

      setProgress((prev) => {
        const withDaily = updateDailyStreak(refreshWeeklyFreeze(prev));
        const combo = correct ? withDaily.sessionCombo + 1 : 0;
        const comboMultiplier = correct ? 1 + Math.min(combo - 1, 4) * 0.15 : 1;
        const criticalHit = correct && Math.random() < 0.18;
        const baseXp = correct ? XP_CORRECT_BASE : XP_WRONG;
        const xpGain = Math.round(baseXp * comboMultiplier * (criticalHit ? 2 : 1));
        const xp = withDaily.xp + xpGain;
        const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);

        const next: DetectiveProgress = {
          ...withDaily,
          xp,
          level,
          sessionCombo: combo,
          bestCombo: Math.max(withDaily.bestCombo, combo),
          totalCorrect: withDaily.totalCorrect + (correct ? 1 : 0),
          manipulatedCaught:
            withDaily.manipulatedCaught + (correct && caughtManipulated ? 1 : 0),
          challengesCompleted: withDaily.challengesCompleted + 1,
        };

        const newAchievements = checkAchievements(next, correct);
        if (newAchievements.length > 0) {
          next.achievements = [...next.achievements, ...newAchievements];
        }

        answerResult = {
          xpGain,
          combo,
          comboMultiplier,
          criticalHit,
          leveledUp: level > withDaily.level,
          newAchievements,
          dailyStreak: next.dailyStreak,
        };

        return next;
      });

      return answerResult;
    },
    [],
  );

  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const accuracy =
    progress.challengesCompleted === 0
      ? 0
      : Math.round((progress.totalCorrect / progress.challengesCompleted) * 100);

  return {
    progress,
    xpInLevel,
    xpToNext: XP_PER_LEVEL,
    accuracy,
    completeOnboarding,
    recordAnswer,
  };
}
