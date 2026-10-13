import { Info } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

/** Tooltip accesible (hover, foco y toque). */
export function InfoTip({ children, label = 'Más información' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:text-cyan-300"
      >
        <Info size={14} aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-lab-800 p-3 text-xs font-normal normal-case leading-relaxed tracking-normal text-slate-200 shadow-xl"
        >
          {children}
        </span>
      )}
    </span>
  );
}
