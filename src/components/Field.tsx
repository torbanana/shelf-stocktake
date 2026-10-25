import type { ReactNode } from 'react';

interface Props {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <span className="error" role="alert">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}
