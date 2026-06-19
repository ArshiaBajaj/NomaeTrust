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
    <div className="ios-alert-root" role="presentation">
      <button type="button" className="ios-alert-backdrop" aria-label="Dismiss" onClick={onCancel} />
      <div className="ios-alert-panel" role="alertdialog" aria-modal="true">
        <div className="ios-alert-content">
          <h2 className="ios-alert-title">{title}</h2>
          {message && <p className="ios-alert-message">{message}</p>}
        </div>
        <div className={`ios-alert-actions ${cancelLabel ? "ios-alert-actions--split" : ""}`}>
          {cancelLabel && (
            <button type="button" className="ios-alert-btn" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`ios-alert-btn ios-alert-btn--confirm ${destructive ? "ios-alert-btn--destructive" : ""}`}
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
