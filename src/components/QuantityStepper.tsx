interface Props {
  value: number;
  onChange: (delta: number) => void;
  small?: boolean;
  label?: string;
}

export function QuantityStepper({ value, onChange, small, label = 'quantity' }: Props) {
  return (
    <div className={`stepper ${small ? 'sm' : ''}`} role="group" aria-label={`Adjust ${label}`}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= 0} onClick={() => onChange(-1)}>
        −
      </button>
      <span className="val" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(1)}>
        +
      </button>
    </div>
  );
}
