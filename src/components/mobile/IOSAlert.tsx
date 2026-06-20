import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "../../hooks/useHaptic";

type IOSAlertProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function IOSAlert({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: IOSAlertProps) {
  const haptic = useHaptic();

  useEffect(() => {
    if (open) haptic(destructive ? "error" : "medium");
  }, [open, destructive, haptic]);

  if (!open) return null;

  return createPortal(
    <div className="nt-overlay" role="presentation">
      <button type="button" className="nt-overlay-backdrop" aria-label="Dismiss" onClick={onCancel} />
      <div className="nt-alert" role="alertdialog" aria-modal="true">
        <div className="px-5 pb-4 pt-6 text-center">
          <h2 className="text-[17px] font-bold text-ink">{title}</h2>
          {message && <p className="mt-1.5 text-[13px] leading-snug text-body">{message}</p>}
        </div>
        <div className={`flex ${cancelLabel ? "flex-row" : "flex-col"} border-t border-line`}>
          {cancelLabel && (
            <button
              type="button"
              className="nt-press flex-1 border-r border-line py-3.5 text-[16px] font-medium text-blue"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`nt-press flex-1 py-3.5 text-[16px] font-bold ${destructive ? "text-danger" : "text-blue"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
