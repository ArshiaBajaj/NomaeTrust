export type AchievementId =
  | "first_case"
  | "combo_3"
  | "combo_5"
  | "daily_3"
  | "deepfake_hunter"
  | "sharp_eye";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_case: {
    id: "first_case",
    title: "First Case Closed",
    description: "Correctly judged your first mystery clip.",
    icon: "🎯",
  },
  combo_3: {
    id: "combo_3",
    title: "On a Roll",
    description: "3 correct answers in a row.",
    icon: "⚡",
  },
  combo_5: {
    id: "combo_5",
    title: "Forensics Streak",
    description: "5 correct answers in a row.",
    icon: "🔥",
  },
  daily_3: {
    id: "daily_3",
    title: "Daily Detective",
    description: "3-day daily streak.",
    icon: "📅",
  },
  deepfake_hunter: {
    id: "deepfake_hunter",
    title: "Deepfake Hunter",
    description: "Spotted 5 manipulated clips.",
    icon: "🎭",
  },
  sharp_eye: {
    id: "sharp_eye",
    title: "Sharp Eye",
    description: "80%+ accuracy over 10 cases.",
    icon: "👁️",
  },
};

export const FORENSIC_TIPS = [
  "Watch the eyes — deepfakes often blink at unnatural intervals.",
  "Check lip sync on P, B, and M sounds — phonemes expose synthetic mouths.",
  "Compare lighting on the face vs. the background for compositing halos.",
  "Forwarded WhatsApp clips strip metadata — treat them as higher risk.",
  "Audio waveform gaps can reveal pasted voice tracks over real video.",
];
