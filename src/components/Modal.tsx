import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Bottom sheet on phones, centred dialog on larger screens. Closes on backdrop tap or Escape. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div className="row between">
            <h2>{title}</h2>
            <button className="icon-btn" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="muted">{message}</p>
      <div className="btn-row">
        <button className="btn secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
