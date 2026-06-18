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
  members: FamilyMember[];
  createdAt: string;
};

export type TrustCircleMe = {
  family: TrustCircleFamily;
  member: FamilyMember;
  trustWords: string[];
  trustPhrase: string;
  secondsUntilRotation: number;
};

export type TrustCircleAuthResponse = TrustCircleMe & {
  sessionToken: string;
  expiresAt: string;
};
