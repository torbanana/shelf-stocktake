import type { ReactNode } from 'react';

interface Props {
  icon?: string;
  title: string;
  message?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({ icon = '🗂️', title, message, actions }: Props) {
  return (
    <div className="empty card">
      <div className="ico" aria-hidden>
        {icon}
      </div>
      <h3>{title}</h3>
      {message && <p className="small">{message}</p>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
