import type { FamilyMember } from "../types/trustCircle";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const RING_COLORS = [
  "bg-emerald-500",
  "bg-accent",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-600",
];

type FamilyMemberRingProps = {
  members: FamilyMember[];
  currentMemberId?: string;
};

export default function FamilyMemberRing({
  members,
  currentMemberId,
}: FamilyMemberRingProps) {
  if (members.length === 0) return null;

  const size = 220;
  const center = size / 2;
  const radius = members.length === 1 ? 0 : 72;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/25" />
      <div className="absolute inset-[28%] flex items-center justify-center rounded-full bg-emerald-500/10">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            Connected
          </p>
          <p className="text-2xl font-serif font-medium text-navy">{members.length}</p>
        </div>
      </div>

      {members.map((member, index) => {
        const angle = (index / members.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle) - 28;
        const y = center + radius * Math.sin(angle) - 28;
        const isYou = member.id === currentMemberId;

        return (
          <div
            key={member.id}
            className="absolute flex w-14 flex-col items-center"
            style={{ left: x, top: y }}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${RING_COLORS[index % RING_COLORS.length]} ${
                isYou ? "ring-4 ring-emerald-300 ring-offset-2" : ""
              }`}
              title={member.displayName}
            >
              {initials(member.displayName)}
            </div>
            <p className="mt-1 max-w-[72px] truncate text-center text-[10px] font-medium text-navy">
              {member.displayName}
              {isYou ? " (you)" : ""}
            </p>
            {member.role === "admin" && (
              <span className="mt-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-800">
                Admin
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
