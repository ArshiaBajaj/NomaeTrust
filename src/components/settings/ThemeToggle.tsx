import { useTheme, type ThemeMode } from "../../context/ThemeContext";
import { useHaptic } from "../../hooks/useHaptic";

const OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const haptic = useHaptic();

  return (
    <div
      role="radiogroup"
      aria-label="Color appearance"
      className="theme-toggle"
    >
      {OPTIONS.map((opt) => {
        const selected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`theme-toggle__option ${selected ? "theme-toggle__option--active" : ""}`}
            onClick={() => {
              if (!selected) {
                haptic("light");
                setTheme(opt.id);
              }
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
