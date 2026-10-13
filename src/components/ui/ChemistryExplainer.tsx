import { AnimatePresence, motion } from 'framer-motion';
import { Atom, Cpu, FlaskConical, Thermometer } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ExplainerLayer {
  level: 'material' | 'dispositivo' | 'chip';
  text: ReactNode;
  /** Clave que cambia cuando el texto cambia (para animar la transición). */
  key: string;
}

const LEVEL = {
  material: { label: '1 · Dentro del material', icon: Atom, cls: 'text-violet-300 border-violet-400/25 bg-violet-400/[0.06]' },
  dispositivo: { label: '2 · Comportamiento electrónico', icon: Cpu, cls: 'text-cyan-300 border-cyan-400/25 bg-cyan-400/[0.06]' },
  chip: { label: '3 · Comportamiento térmico del chip', icon: Thermometer, cls: 'text-orange-300 border-orange-400/25 bg-orange-400/[0.06]' },
};

/** Sección «¿Qué está ocurriendo químicamente?» con los tres niveles diferenciados. */
export function ChemistryExplainer({ layers, title = '¿Qué está ocurriendo químicamente?', compact }: { layers: ExplainerLayer[]; title?: string; compact?: boolean }) {
  return (
    <section className="panel-strong p-4 sm:p-5" aria-live="polite">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <FlaskConical size={18} className="text-cyan-300" aria-hidden />
        {title}
      </h2>
      <div className={`mt-3 grid gap-3 ${compact ? '' : 'md:grid-cols-3'}`}>
        {layers.map((l) => {
          const info = LEVEL[l.level];
          const Icon = info.icon;
          return (
            <div key={l.level} className={`rounded-xl border p-3 ${info.cls}`}>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                <Icon size={13} aria-hidden />
                {info.label}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={l.key}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1.5 text-sm leading-relaxed text-slate-200"
                >
                  {l.text}
                </motion.p>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
