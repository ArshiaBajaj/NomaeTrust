import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "../../hooks/useHaptic";

export type ActionSheetOption = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

type ActionSheetProps = {
  open: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  onClose: () => void;
  children?: ReactNode;
};

export default function ActionSheet({
  open,
  title,
  message,
  options,
  onClose,
  children,
}: ActionSheetProps) {
  const haptic = useHaptic();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="ios-sheet-root" role="presentation">
      <button
        type="button"
        className="ios-sheet-backdrop"
        aria-label="Dismiss"
        onClick={() => {
          haptic("light");
          onClose();
        }}
      />
      <div className="ios-sheet-panel" role="dialog" aria-modal="true">
        {(title || message) && (
          <div className="ios-sheet-header">
            {title && <p className="ios-sheet-title">{title}</p>}
            {message && <p className="ios-sheet-message">{message}</p>}
          </div>
        )}
        {children}
        <div className="ios-sheet-group">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`ios-sheet-option ${opt.destructive ? "ios-sheet-option--destructive" : ""}`}
              onClick={() => {
                haptic(opt.destructive ? "medium" : "light");
                onClose();
                opt.onSelect();
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ios-sheet-cancel ios-btn"
          onClick={() => {
            haptic("light");
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  );
}
