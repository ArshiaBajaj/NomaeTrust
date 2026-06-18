import { useState } from "react";

type InviteCodeCardProps = {
  inviteCode: string;
  familyName: string;
};

export default function InviteCodeCard({ inviteCode, familyName }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Join our NomaeTrust Family Circle "${familyName}" with code: ${inviteCode}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
        Family invite code
      </p>
      <p className="mt-1 text-sm text-text-muted">
        Share with family so everyone sees the same verify words.
      </p>
      <p className="mt-4 font-mono text-3xl font-bold tracking-widest text-navy">
        {inviteCode}
      </p>
      <button type="button" onClick={handleCopy} className="btn-primary mt-4 w-full text-sm">
        {copied ? "Copied!" : "Copy invite message"}
      </button>
    </div>
  );
}
