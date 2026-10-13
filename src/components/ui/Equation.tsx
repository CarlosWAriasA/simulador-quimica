import type { ReactNode } from 'react';
import { RefCite } from './RefCite';

export interface EquationVar {
  sym: ReactNode;
  desc: string;
  unit?: string;
}

interface EquationProps {
  name?: string;
  children: ReactNode;
  vars?: EquationVar[];
  refs?: string[];
  validity?: string;
}

/** Ecuación visible con explicación de cada variable. */
export function Equation({ name, children, vars, refs, validity }: EquationProps) {
  return (
    <figure className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-4">
      {name && (
        <figcaption className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
          <span>{name}</span>
          {refs && <RefCite ids={refs} />}
        </figcaption>
      )}
      <div className="overflow-x-auto py-1 text-center font-mono text-lg text-white sm:text-xl">{children}</div>
      {vars && (
        <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs text-slate-300 sm:grid-cols-2">
          {vars.map((v, i) => (
            <div key={i} className="flex gap-2">
              <dt className="min-w-[2.5rem] font-mono font-semibold text-violet-200">{v.sym}</dt>
              <dd>
                {v.desc}
                {v.unit && <span className="text-slate-500"> [{v.unit}]</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {validity && <p className="mt-2 border-t border-white/5 pt-2 text-xs text-amber-200/80">Validez: {validity}</p>}
    </figure>
  );
}
