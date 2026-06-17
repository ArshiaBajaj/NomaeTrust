import type { VoicePassport } from "../types";
import {
  formatTrustWords,
  getOrCreateFamilySecret,
  getRotatingTrustWords,
} from "../utils/trustCircle";

const STORAGE_KEY = "nomae-voice-passports";

export function loadVoicePassports(): VoicePassport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPassports();
    const parsed = JSON.parse(raw) as VoicePassport[];
    return parsed.length > 0 ? parsed : getDefaultPassports();
  } catch {
    return getDefaultPassports();
  }
}

function getDefaultPassports(): VoicePassport[] {
  const code = formatTrustWords(getRotatingTrustWords());
  return [
    {
      contactName: "Cousin Amina",
      voiceprintId: "vp-amina-001",
      enrolledAt: "2025-11-14T10:00:00Z",
      trustScore: 0.97,
      challengeCode: code,
    },
    {
      contactName: "Mom (Fatima)",
      voiceprintId: "vp-fatima-001",
      enrolledAt: "2025-11-14T10:05:00Z",
      trustScore: 0.95,
      challengeCode: code,
    },
  ];
}

export function saveVoicePassports(passports: VoicePassport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(passports));
}

export function enrollVoicePassport(contactName: string): VoicePassport {
  const passports = loadVoicePassports();
  const passport: VoicePassport = {
    contactName,
    voiceprintId: `vp-${Date.now().toString(36)}`,
    enrolledAt: new Date().toISOString(),
    trustScore: 0.92,
    challengeCode: formatTrustWords(getRotatingTrustWords()),
  };
  saveVoicePassports([passport, ...passports]);
  return passport;
}

export function getFamilyChallengeCode(): string {
  return formatTrustWords(getRotatingTrustWords());
}

export function getFamilyPairingCode(): string {
  return getOrCreateFamilySecret();
}
