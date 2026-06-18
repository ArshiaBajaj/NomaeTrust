import {
  formatTrustWords,
  getCurrentTrustPhrase,
  getRotatingTrustWords,
  getSecondsUntilRotation,
} from "../services/trustWords.js";

export type FamilyMemberRole = "admin" | "member";

export type FamilyMember = {
  id: string;
  displayName: string;
  role: FamilyMemberRole;
  joinedAt: string;
};

export type TrustCircleFamily = {
  id: string;
  name: string;
  inviteCode: string;
  familySecret: string;
  members: FamilyMember[];
  createdAt: string;
};

export type TrustCircleSession = {
  token: string;
  memberId: string;
  familyId: string;
  expiresAt: string;
};

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SESSION_DAYS = 30;

const families = new Map<string, TrustCircleFamily>();
const inviteIndex = new Map<string, string>();
const sessions = new Map<string, TrustCircleSession>();

function randomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    if (i === 3) code += "-";
    code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  }
  return code;
}

function uniqueInviteCode(): string {
  let code = generateInviteCode();
  while (inviteIndex.has(code)) {
    code = generateInviteCode();
  }
  return code;
}

function createSession(memberId: string, familyId: string): TrustCircleSession {
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const session: TrustCircleSession = {
    token: randomId("tc-session"),
    memberId,
    familyId,
    expiresAt,
  };
  sessions.set(session.token, session);
  return session;
}

export type TrustCircleMeResponse = {
  family: {
    id: string;
    name: string;
    inviteCode: string;
    members: FamilyMember[];
    createdAt: string;
  };
  member: FamilyMember;
  trustWords: string[];
  trustPhrase: string;
  secondsUntilRotation: number;
};

function buildMeResponse(
  family: TrustCircleFamily,
  member: FamilyMember,
): TrustCircleMeResponse {
  const trustWords = getRotatingTrustWords(family.familySecret);
  return {
    family: {
      id: family.id,
      name: family.name,
      inviteCode: family.inviteCode,
      members: [...family.members],
      createdAt: family.createdAt,
    },
    member,
    trustWords,
    trustPhrase: formatTrustWords(trustWords),
    secondsUntilRotation: getSecondsUntilRotation(),
  };
}

export function createFamily(
  familyName: string,
  displayName: string,
): { session: TrustCircleSession; me: TrustCircleMeResponse } {
  const memberId = randomId("member");
  const familyId = randomId("family");
  const inviteCode = uniqueInviteCode();
  const familySecret = `nt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

  const member: FamilyMember = {
    id: memberId,
    displayName: displayName.trim(),
    role: "admin",
    joinedAt: new Date().toISOString(),
  };

  const family: TrustCircleFamily = {
    id: familyId,
    name: familyName.trim(),
    inviteCode,
    familySecret,
    members: [member],
    createdAt: new Date().toISOString(),
  };

  families.set(familyId, family);
  inviteIndex.set(inviteCode, familyId);

  const session = createSession(memberId, familyId);
  return { session, me: buildMeResponse(family, member) };
}

export function joinFamily(
  inviteCode: string,
  displayName: string,
): { session: TrustCircleSession; me: TrustCircleMeResponse } | null {
  const normalized = inviteCode.trim().toUpperCase();
  const familyId = inviteIndex.get(normalized);
  if (!familyId) return null;

  const family = families.get(familyId);
  if (!family) return null;

  const member: FamilyMember = {
    id: randomId("member"),
    displayName: displayName.trim(),
    role: "member",
    joinedAt: new Date().toISOString(),
  };

  family.members.push(member);
  const session = createSession(member.id, family.id);
  return { session, me: buildMeResponse(family, member) };
}

export function resolveSession(token: string): TrustCircleSession | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function getMeFromToken(token: string): TrustCircleMeResponse | null {
  const session = resolveSession(token);
  if (!session) return null;

  const family = families.get(session.familyId);
  if (!family) return null;

  const member = family.members.find((m) => m.id === session.memberId);
  if (!member) return null;

  return buildMeResponse(family, member);
}

export function getFamilySecretFromToken(token: string): string | null {
  const session = resolveSession(token);
  if (!session) return null;
  const family = families.get(session.familyId);
  return family?.familySecret ?? null;
}

export function leaveSession(token: string): boolean {
  return sessions.delete(token);
}

export function verifyChallengeForToken(
  token: string,
  challengeResponse: string,
): boolean {
  const secret = getFamilySecretFromToken(token);
  if (!secret) return false;
  const expected = getCurrentTrustPhrase(secret);
  const normalized = challengeResponse.trim().toUpperCase().replace(/\s+/g, " ");
  return normalized === expected;
}
