import type { ReactNode } from 'react';
import { useUndo } from '../lib/undo';
import { useToast } from './Toast';

interface Props {
  title: string;
  subtitle?: ReactNode;
  /** Something shown before the title, e.g. the mascot. */
  leading?: ReactNode;
  /** Extra buttons on the right, after Undo. */
  actions?: ReactNode;
}

/** Page title plus an always-visible Undo button whenever there is something to undo. */
export function TopBar({ title, subtitle, leading, actions }: Props) {
  const { canUndo, label, undo } = useUndo();
  const toast = useToast();

  async function onUndo() {
    const done = await undo();
    toast.show(done ? `Undid ${done}.` : 'Nothing to undo.');
  }

  return (
    <header className="page-header">
      {leading}
      <div className="title">
        <h1 className="truncate">{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      {canUndo && (
        <button className="btn secondary sm undo-btn" onClick={onUndo} title={label ? `Undo ${label}` : 'Undo'}>
          ↶ Undo
        </button>
      )}
      {actions}
    </header>
  );
}
