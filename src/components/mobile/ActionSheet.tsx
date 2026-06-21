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

export default function ActionSheet({ open, title, message, options, onClose, children }: ActionSheetProps) {
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
    <div className="nt-overlay" style={{ padding: 8, paddingBottom: "max(8px, env(safe-area-inset-bottom))" }} role="presentation">
      <button
        type="button"
        className="nt-overlay-backdrop"
        aria-label="Dismiss"
        onClick={() => {
          haptic("light");
          onClose();
        }}
      />
      <div className="nt-sheet" role="dialog" aria-modal="true">
        <div className="overflow-hidden rounded-[18px] nt-glass" style={{ background: "rgba(252,251,255,0.96)" }}>
          {(title || message) && (
            <div className="border-b border-line px-4 py-3.5 text-center">
              {title && <p className="text-[13px] font-bold text-ink">{title}</p>}
              {message && <p className="mt-1 text-[12px] leading-snug text-muted">{message}</p>}
            </div>
          )}
          {children}
          {options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              className={`nt-press w-full py-4 text-[17px] font-medium ${i > 0 || title || message ? "border-t border-line" : ""} ${opt.destructive ? "text-danger" : "text-blue"}`}
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
          className="nt-press mt-2 w-full rounded-[18px] bg-white py-4 text-[17px] font-bold text-blue"
          style={{ boxShadow: "var(--shadow-soft)" }}
          onClick={() => {
            haptic("light");
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.getElementById("nt-modal-root") ?? document.body,
  );
}
