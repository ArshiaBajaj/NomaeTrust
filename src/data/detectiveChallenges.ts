export type HighlightRegion = "eyes" | "mouth" | "audio" | "lighting";
export type ChallengeCategory = "Politics" | "News" | "Health" | "Crisis" | "Social";

export type DetectiveChallenge = {
  id: string;
  mediaType?: "video" | "image";
  videoUrl?: string;
  thumbnailUrl: string;
  mediaLabel: string;
  category: ChallengeCategory;
  sourceContext: string;
  prompt: string;
  isManipulated: boolean;
  hiveVerdict: string;
  confidence: number;
  explanation: string;
  highlightRegion: HighlightRegion;
  artifactLabel: string;
};

export const DETECTIVE_CHALLENGES: DetectiveChallenge[] = [
  {
    id: "ch-1",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    mediaLabel: "Politician podium clip",
    category: "Politics",
    sourceContext: "Forwarded in a family group chat as “breaking tonight”",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: true,
    hiveVerdict: "Deepfake detected",
    confidence: 98.4,
    explanation:
      "The subject's eye blinking pattern does not synchronize naturally with their speech rhythm or speed, which is a common deepfake artifact.",
    highlightRegion: "eyes",
    artifactLabel: "Eye blink desync",
  },
  {
    id: "ch-2",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1586339949911-93e4750d4dda?w=800&q=80",
    mediaLabel: "Local news broadcast",
    category: "News",
    sourceContext: "Clip from verified station live feed",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: false,
    hiveVerdict: "No manipulation detected",
    confidence: 96.2,
    explanation:
      "Facial micro-movements, lighting consistency, and audio-visual sync match patterns of an authentic broadcast recording.",
    highlightRegion: "audio",
    artifactLabel: "Clean A/V sync",
  },
  {
    id: "ch-3",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    mediaLabel: "Viral WhatsApp clip",
    category: "Social",
    sourceContext: "Re-shared 12× with caption removed",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: true,
    hiveVerdict: "Synthetic media detected",
    confidence: 91.7,
    explanation:
      "Mouth shape during plosive consonants drifts from expected phoneme shapes — typical of lip-sync deepfake generation.",
    highlightRegion: "mouth",
    artifactLabel: "Lip-sync drift",
  },
  {
    id: "ch-4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    mediaLabel: "Press conference feed",
    category: "News",
    sourceContext: "Official agency livestream archive",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: false,
    hiveVerdict: "Authentic media",
    confidence: 94.8,
    explanation:
      "Shadow direction on the face matches room lighting across frames with no temporal flicker in skin texture.",
    highlightRegion: "lighting",
    artifactLabel: "Consistent lighting",
  },
  {
    id: "ch-5",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    mediaLabel: "Forwarded crisis footage",
    category: "Crisis",
    sourceContext: "Claimed as “happening now in Atlanta”",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: true,
    hiveVerdict: "Deepfake detected",
    confidence: 89.3,
    explanation:
      "Background edge halos around the subject suggest compositing — pixels at the hairline fail natural boundary blending.",
    highlightRegion: "lighting",
    artifactLabel: "Edge halo compositing",
  },
  {
    id: "ch-6",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    mediaLabel: "Hospital announcement",
    category: "Health",
    sourceContext: "County health dept. Facebook page",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: false,
    hiveVerdict: "Authentic media",
    confidence: 97.1,
    explanation:
      "Natural head motion parallax and consistent badge reflections indicate a single continuous camera take.",
    highlightRegion: "eyes",
    artifactLabel: "Natural parallax",
  },
  {
    id: "ch-7",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    mediaLabel: "AI voice-over meme",
    category: "Social",
    sourceContext: "TikTok repost with new audio track",
    prompt: "Watch the clip. Swipe LEFT if manipulated, RIGHT if verified.",
    isManipulated: true,
    hiveVerdict: "Audio manipulation detected",
    confidence: 93.6,
    explanation:
      "Waveform energy peaks do not align with visible mouth openings — audio was likely replaced after capture.",
    highlightRegion: "audio",
    artifactLabel: "Audio replacement",
  },
];

export const MOCK_LEADERBOARD: Array<{
  rank: number;
  name: string;
  score: number;
  isUser?: boolean;
}> = [
  { rank: 1, name: "Maya K.", score: 4820 },
  { rank: 2, name: "You", score: 0, isUser: true },
  { rank: 3, name: "Jordan T.", score: 3910 },
];

export const XP_PER_LEVEL = 500;
export const XP_CORRECT_BASE = 50;
export const XP_WRONG = 5;
export const STREAK_FREEZES_PER_WEEK = 1;
export const AUTO_NEXT_SECONDS = 4;

export function shuffleChallenges<T>(items: T[]): T[] {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
