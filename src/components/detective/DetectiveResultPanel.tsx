import type { AnswerResult } from "../../hooks/useDetectiveProgress";
import type { DetectiveChallenge } from "../../data/detectiveChallenges";
import Confetti from "../mobile/Confetti";
import NomiMascot from "../NomiMascot";

type DetectiveResultPanelProps = {
  challenge: DetectiveChallenge;
  correct: boolean;
  answerMeta: AnswerResult;
  autoNextSeconds: number;
  onNext: () => void;
};

const REGION_LABEL: Record<DetectiveChallenge["highlightRegion"], string> = {
  eyes: "Eyes & blink pattern",
  mouth: "Mouth & lip sync",
  audio: "Audio waveform",
  lighting: "Lighting & shadows",
};

export default function DetectiveResultPanel({
  challenge,
  correct,
  answerMeta,
  autoNextSeconds,
  onNext,
}: DetectiveResultPanelProps) {
  const accent = correct ? "#8fe3c6" : "#ff9db8";

  const headline = correct
    ? challenge.isManipulated
      ? "Correct — you caught the manipulation"
      : "Correct — this clip looks authentic"
    : challenge.isManipulated
      ? "Missed — this clip was manipulated"
      : "Missed — this clip appears authentic";

  return (
    <div
      className="relative flex w-full flex-col gap-3"
      style={{ animation: "ddResultIn 0.35s cubic-bezier(0.22,1,0.36,1)" }}
    >
      <style>{`@keyframes ddResultIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Confetti trigger={correct} />

      {/* Nomi coaching moment */}
      <div className="flex items-start gap-2.5">
        <NomiMascot size={56} mood={correct ? "happy" : "sad"} className="nt-bob shrink-0" />
        <div className="nt-bubble mt-0.5 flex-1">
          {correct
            ? "Nice catch — your eye is getting sharp!"
            : `Almost! The tell was ${challenge.artifactLabel.toLowerCase()}.`}
        </div>
      </div>

      {/* verdict header */}
      <div
        className="flex items-center gap-3"
        style={{
          borderRadius: 18,
          padding: "12px 14px",
          background: `${accent}1f`,
          border: `1px solid ${accent}66`,
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center text-lg font-black"
          style={{ borderRadius: 999, background: accent, color: "#15132b" }}
        >
          {correct ? "✓" : "✕"}
        </span>
        <p className="text-sm font-bold" style={{ color: "#fff" }}>
          {headline}
        </p>
      </div>

      {/* reward chips */}
      {(answerMeta.criticalHit ||
        answerMeta.combo > 1 ||
        answerMeta.leveledUp) && (
        <div className="flex flex-wrap gap-2">
          <Chip grad="var(--grad-butter)" ink="#15132b">
            +{answerMeta.xpGain} XP
          </Chip>
          {answerMeta.criticalHit && (
            <Chip grad="var(--grad-pink)" ink="#7a2740">
              Critical hit 2×
            </Chip>
          )}
          {answerMeta.combo > 1 && (
            <Chip grad="var(--grad-blue)" ink="#fff">
              {answerMeta.combo}× combo +
              {Math.round((answerMeta.comboMultiplier - 1) * 100)}%
            </Chip>
          )}
          {answerMeta.leveledUp && (
            <Chip grad="var(--grad-mint)" ink="#15132b">
              Level up!
            </Chip>
          )}
        </div>
      )}

      {/* forensic + AI verdict */}
      <div
        className="flex flex-col gap-3"
        style={{
          borderRadius: 18,
          padding: "14px",
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.3)",
          backdropFilter: "saturate(160%) blur(14px)",
          WebkitBackdropFilter: "saturate(160%) blur(14px)",
        }}
      >
        <div>
          <p
            className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#fff" }}
          >
            Forensic tell · {REGION_LABEL[challenge.highlightRegion]}
          </p>
          <p className="text-sm font-bold" style={{ color: "#fff" }}>
            {challenge.artifactLabel}
          </p>
        </div>

        <div
          className="flex items-center gap-3"
          style={{
            borderRadius: 14,
            padding: "10px 12px",
            background: "rgba(255,255,255,0.14)",
          }}
        >
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              AI Verdict · Hive API
            </p>
            <p className="truncate text-sm font-semibold" style={{ color: "#fff" }}>
              {challenge.hiveVerdict}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-lg font-black leading-none"
              style={{ color: challenge.isManipulated ? "#ffd0dd" : "#c4f3e2" }}
            >
              {challenge.confidence}%
            </p>
            <p
              className="text-[10px] uppercase tracking-wide"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              confidence
            </p>
          </div>
        </div>

        <p
          className="text-[13px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          {challenge.explanation}
        </p>

        {!correct && (
          <p
            className="text-[12px] font-medium leading-relaxed"
            style={{
              color: "#ffd36e",
              borderTop: "1px solid rgba(255,211,110,0.4)",
              paddingTop: 10,
            }}
          >
            Tip next time: focus on {challenge.artifactLabel.toLowerCase()}.
          </p>
        )}
      </div>

      <button type="button" onClick={onNext} className="nt-btn-3d nt-btn-3d--green nt-btn-3d--block">
        {autoNextSeconds > 0 ? `Next case (${autoNextSeconds}s)` : "Start next challenge"}
      </button>
    </div>
  );
}

function Chip({
  children,
  grad,
  ink,
}: {
  children: React.ReactNode;
  grad: string;
  ink: string;
}) {
  return (
    <span
      className="text-[11px] font-bold"
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        background: grad,
        color: ink,
        boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)",
      }}
    >
      {children}
    </span>
  );
}
