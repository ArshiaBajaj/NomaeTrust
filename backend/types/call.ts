export type VoicePassport = {
  contactName: string;
  voiceprintId: string;
  enrolledAt: string;
  trustScore: number;
  challengeCode?: string;
};
