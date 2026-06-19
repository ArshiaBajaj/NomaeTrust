import type { AnswerResult } from "../../hooks/useDetectiveProgress";
import type { DetectiveChallenge } from "../../data/detectiveChallenges";

type DetectiveResultPanelProps = {
  challenge: DetectiveChallenge;
  correct: boolean;
  answerMeta: AnswerResult;
  autoNextSeconds: number;
  onNext: () => void;
};

export default function DetectiveResultPanel({
  challenge,
  correct,
  answerMeta,
  autoNextSeconds,
  onNext,
}: DetectiveResultPanelProps) {
  return (
    <div className="detective-result">
      <p className={correct ? "detective-result-ok" : "detective-result-miss"}>
        {correct
          ? challenge.isManipulated
            ? "RESULT: CORRECT! You caught the manipulation."
            : "RESULT: CORRECT! This clip looks authentic."
          : challenge.isManipulated
            ? "RESULT: MISSED — this clip was manipulated."
            : "RESULT: MISSED — this clip appears authentic."}
      </p>

      <div className="detective-result-rewards">
        {answerMeta.criticalHit && (
          <span className="detective-reward-chip detective-reward-chip--critical">
            Critical hit 2×
          </span>
        )}
        {answerMeta.combo > 1 && (
          <span className="detective-reward-chip">
            {answerMeta.combo}× combo (+{Math.round((answerMeta.comboMultiplier - 1) * 100)}%)
          </span>
        )}
        {answerMeta.leveledUp && (
          <span className="detective-reward-chip detective-reward-chip--level">Level up!</span>
        )}
      </div>

      <div className="detective-result-panel">
        <p className="detective-artifact-tag">
          Forensic tell: <strong>{challenge.artifactLabel}</strong>
        </p>
        <p>
          <strong>AI Verdict (Hive API):</strong> {challenge.hiveVerdict} (
          {challenge.confidence}% confidence)
        </p>
        <p className="detective-result-explain">
          <strong>EXPLANATION:</strong> {challenge.explanation}
        </p>
        {!correct && (
          <p className="detective-result-tip">
            <strong>Tip next time:</strong> Focus on {challenge.artifactLabel.toLowerCase()}.
          </p>
        )}
      </div>

      <button type="button" className="detective-btn-next" onClick={onNext}>
        {autoNextSeconds > 0
          ? `NEXT CASE (${autoNextSeconds}s)`
          : "START NEXT CHALLENGE"}
      </button>
    </div>
  );
}
