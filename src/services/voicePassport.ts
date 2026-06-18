import type { VoicePassport } from "../types";

function storageKey(familyId: string): string {
  return `nomae-voice-passports-${familyId}`;
}

export function loadVoicePassports(familyId: string): VoicePassport[] {
  try {
    const raw = localStorage.getItem(storageKey(familyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VoicePassport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVoicePassports(
  familyId: string,
  passports: VoicePassport[],
): void {
  localStorage.setItem(storageKey(familyId), JSON.stringify(passports));
}

export function enrollVoicePassport(
  familyId: string,
  contactName: string,
): VoicePassport {
  const passports = loadVoicePassports(familyId);
  const passport: VoicePassport = {
    contactName,
    voiceprintId: `vp-${Date.now().toString(36)}`,
    enrolledAt: new Date().toISOString(),
    trustScore: 0.92,
  };
  saveVoicePassports(familyId, [passport, ...passports]);
  return passport;
}

export function seedPassportsFromMembers(
  familyId: string,
  memberNames: string[],
): VoicePassport[] {
  const existing = loadVoicePassports(familyId);
  if (existing.length > 0) return existing;

  const seeded = memberNames.slice(0, 4).map((name, i) => ({
    contactName: name,
    voiceprintId: `vp-seed-${i}-${Date.now().toString(36)}`,
    enrolledAt: new Date().toISOString(),
    trustScore: 0.9 + i * 0.02,
  }));
  saveVoicePassports(familyId, seeded);
  return seeded;
}
