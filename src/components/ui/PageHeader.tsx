import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, icon: Icon, actions }: { eyebrow: string; title: ReactNode; description?: ReactNode; icon?: LucideIcon; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
          {Icon && <Icon size={14} aria-hidden />}
          {eyebrow}
        </div>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-base leading-relaxed text-slate-300">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
