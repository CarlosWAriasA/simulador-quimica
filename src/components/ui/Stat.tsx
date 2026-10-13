import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DataKind } from '../../types';
import { DataTag } from './DataTag';

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  icon?: LucideIcon;
  color?: string;
  kind?: DataKind;
  size?: 'sm' | 'md' | 'lg';
}

export function Stat({ label, value, unit, sub, icon: Icon, color, kind, size = 'md' }: StatProps) {
  const vs = size === 'lg' ? 'text-4xl sm:text-5xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div className="rounded-xl border border-white/[0.06] bg-lab-950/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          {Icon && <Icon size={14} aria-hidden style={color ? { color } : undefined} />}
          {label}
        </span>
        {kind && <DataTag kind={kind} compact />}
      </div>
      <div className={`num mt-1 font-semibold leading-tight text-white ${vs}`} style={color ? { color } : undefined}>
        {value}
        {unit && <span className="ml-1 text-[0.55em] font-medium text-slate-400">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
