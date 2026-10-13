import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: LucideIcon;
  hint?: string;
  color?: string;
}

interface SegmentedProps<T extends string> {
  label?: ReactNode;
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Segmented<T extends string>({ label, options, value, onChange, columns, size = 'md' }: SegmentedProps<T>) {
  const pad = size === 'lg' ? 'px-3 py-3 text-base' : size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-2 text-sm';
  return (
    <div className="space-y-1.5">
      {label && <div className="text-sm font-medium text-slate-300">{label}</div>}
      <div
        role="radiogroup"
        className="grid gap-1.5 rounded-xl border border-white/[0.06] bg-lab-950/60 p-1"
        style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const active = o.value === value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.hint}
              onClick={() => onChange(o.value)}
              className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors ${pad} ${
                active ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
              }`}
              style={active && o.color ? { boxShadow: `inset 0 0 0 2px ${o.color}` } : undefined}
            >
              {Icon && <Icon size={size === 'lg' ? 18 : 15} aria-hidden className="shrink-0" />}
              <span className="min-w-0 leading-tight">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
