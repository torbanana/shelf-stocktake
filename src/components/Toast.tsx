import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastApi {
  show: (message: string, opts?: { actionLabel?: string; onAction?: () => void; duration?: number }) => void;
}

const Ctx = createContext<ToastApi>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const show = useCallback<ToastApi['show']>((message, opts) => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-2), { id, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction }]);
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), opts?.duration ?? 3200);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="toast">
            <span className="grow">{t.message}</span>
            {t.actionLabel && (
              <button
                onClick={() => {
                  t.onAction?.();
                  setItems((list) => list.filter((x) => x.id !== t.id));
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
