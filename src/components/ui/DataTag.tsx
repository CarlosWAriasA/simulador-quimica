import { BookOpen, Calculator, Lightbulb, SlidersHorizontal } from 'lucide-react';
import type { DataKind } from '../../types';

export const DATA_KIND_INFO: Record<DataKind, { label: string; cls: string; icon: typeof BookOpen; description: string }> = {
  publicado: {
    label: 'Dato publicado',
    cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    icon: BookOpen,
    description: 'Valor tomado de literatura científica, con referencia.',
  },
  supuesto: {
    label: 'Supuesto',
    cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    icon: SlidersHorizontal,
    description: 'Parámetro elegido para un diseño hipotético.',
  },
  calculado: {
    label: 'Calculado',
    cls: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
    icon: Calculator,
    description: 'Resultado de una ecuación documentada; no es una medición.',
  },
  conceptual: {
    label: 'Conceptual',
    cls: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
    icon: Lightbulb,
    description: 'Representación visual o educativa, no cuantitativa.',
  },
};

export function DataTag({ kind, compact = false }: { kind: DataKind; compact?: boolean }) {
  const info = DATA_KIND_INFO[kind];
  const Icon = info.icon;
  return (
    <span className={`chip-tag ${info.cls}`} title={info.description}>
      <Icon size={11} aria-hidden />
      {!compact && info.label}
      {compact && <span className="sr-only">{info.label}</span>}
    </span>
  );
}

export function DataLegend() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Leyenda de tipos de datos">
      {(Object.keys(DATA_KIND_INFO) as DataKind[]).map((k) => (
        <DataTag key={k} kind={k} />
      ))}
    </div>
  );
}
