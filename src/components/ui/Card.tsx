import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  accent?: 'cyan' | 'violet' | 'amber' | 'none';
  id?: string;
}

const ACCENT = {
  cyan: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
  violet: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
  amber: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  none: 'text-slate-300 bg-white/5 border-white/10',
};

export function Card({ title, subtitle, icon: Icon, actions, children, className = '', bodyClassName = '', accent = 'cyan', id }: CardProps) {
  return (
    <section id={id} className={`panel flex flex-col ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${ACCENT[accent]}`}>
                <Icon size={16} aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold leading-snug sm:text-lg">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-400 sm:text-sm">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`flex-1 p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
