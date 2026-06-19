import { ACHIEVEMENTS, type AchievementId } from "../../data/detectiveAchievements";

type AchievementToastProps = {
  ids: AchievementId[];
  onDone: () => void;
};

export default function AchievementToast({ ids, onDone }: AchievementToastProps) {
  if (ids.length === 0) return null;

  const achievement = ACHIEVEMENTS[ids[0]];

  return (
    <div className="detective-achievement-toast" role="status">
      <span className="detective-achievement-icon">{achievement.icon}</span>
      <div>
        <p className="detective-achievement-title">Badge unlocked!</p>
        <p className="detective-achievement-name">{achievement.title}</p>
        <p className="detective-achievement-desc">{achievement.description}</p>
      </div>
      <button type="button" className="detective-achievement-dismiss" onClick={onDone}>
        ✓
      </button>
    </div>
  );
}
