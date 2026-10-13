import { useId, type CSSProperties, type ReactNode } from 'react';

interface SliderProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Texto mostrado como valor actual. */
  display: ReactNode;
  hint?: ReactNode;
  color?: string;
  minLabel?: string;
  maxLabel?: string;
  large?: boolean;
  ariaValueText?: string;
}

export function Slider({ label, value, min, max, step = 1, onChange, display, hint, color = '#22d3ee', minLabel, maxLabel, large, ariaValueText }: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const style = { '--pct': `${pct}%`, '--fill': color } as CSSProperties;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className={large ? 'text-base font-semibold text-slate-200' : 'text-sm font-medium text-slate-300'}>
          {label}
        </label>
        <span className={`num font-semibold text-white ${large ? 'text-2xl' : 'text-base'}`}>{display}</span>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        style={style}
        aria-valuetext={ariaValueText}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {hint && <p className="text-xs leading-snug text-slate-400">{hint}</p>}
    </div>
  );
}
