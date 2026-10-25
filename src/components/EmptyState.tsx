import type { ReactNode } from 'react';

interface Props {
  icon?: string;
  /** Optional drawing shown instead of the emoji icon. */
  illustration?: ReactNode;
  title: string;
  message?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({ icon = '🗂️', illustration, title, message, actions }: Props) {
  return (
    <div className="empty card">
      {illustration ? (
        <div className="illus">{illustration}</div>
      ) : (
        <div className="ico" aria-hidden>
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {message && <p className="small">{message}</p>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
