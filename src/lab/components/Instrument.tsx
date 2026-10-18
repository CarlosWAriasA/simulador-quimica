import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface InstrumentProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: LucideIcon;
  /** Indicador luminoso del instrumento. */
  led?: { on: boolean; label: string; color?: string };
  hint?: ReactNode;
  large?: boolean;
}

/** Pantalla tipo LCD de un instrumento de laboratorio. */
export function Instrument({ label, value, unit, icon: Icon, led, hint, large }: InstrumentProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 p-3 shadow-inner">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon size={14} aria-hidden />}
          {label}
        </span>
        {led && (
          <span className="flex items-center gap-1.5 normal-case tracking-normal" aria-live="polite">
            <span
              className="h-2.5 w-2.5 rounded-full transition-colors"
              style={{ background: led.on ? led.color ?? '#34d399' : '#334155', boxShadow: led.on ? `0 0 10px ${led.color ?? '#34d399'}` : 'none' }}
              aria-hidden
            />
            <span className={led.on ? 'text-emerald-200' : 'text-slate-500'}>{led.label}</span>
          </span>
        )}
      </div>
      <div className="mt-2 rounded-lg border border-emerald-400/10 bg-[#06140f] px-3 py-2 text-right shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
        <span className={`num font-semibold text-emerald-300 ${large ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`} style={{ textShadow: '0 0 12px rgba(52,211,153,0.35)' }}>
          {value}
        </span>
        {unit && <span className="num ml-1.5 text-base text-emerald-400/70">{unit}</span>}
      </div>
      {hint && <div className="mt-1.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
