import { motion } from 'framer-motion';
import { ArrowRight, Beaker, CheckCircle2, Clock, FlaskConical, Gauge, Microscope, NotebookPen, Thermometer, Wind } from 'lucide-react';
import { useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { PRACTICES } from '../lab/practices';
import { loadRecord, practiceProgress } from '../lab/storage';
import type { PracticeId } from '../lab/types';

const ICON: Record<PracticeId, typeof Beaker> = { p1: Thermometer, p2: Wind, p3: Gauge, p4: Microscope };
const GRADIENT: Record<PracticeId, string> = {
  p1: 'from-orange-500/20',
  p2: 'from-sky-500/20',
  p3: 'from-violet-500/20',
  p4: 'from-emerald-500/20',
};

const METHOD = [
  { t: 'Hipótesis', d: 'Predice qué pasará antes de medir.' },
  { t: 'Experimento', d: 'Manipula el banco y registra mediciones.' },
  { t: 'Análisis', d: 'Grafica tus datos y ajusta un modelo.' },
  { t: 'Preguntas', d: 'Comprueba lo que entendiste.' },
  { t: 'Informe', d: 'Concluye e imprime tu reporte.' },
];

export function LabHubPage() {
  const progress = useMemo(
    () => Object.fromEntries(PRACTICES.map((p) => [p.id, practiceProgress(loadRecord(p.id), p.minRows, p.questions.length)])) as Record<PracticeId, number>,
    [],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Laboratorio virtual"
        icon={Beaker}
        title="Prácticas de laboratorio"
        description="Aquí no sólo observas: haces el experimento. Formulas una hipótesis, manipulas instrumentos, registras tus datos en una bitácora, los analizas y redactas un informe."
        actions={
          <a href="#/simulador" className="btn-ghost whitespace-nowrap">
            <FlaskConical size={16} aria-hidden /> Modo libre: simulador
          </a>
        }
      />

      <section className="panel p-5">
        <h2 className="text-lg font-semibold">Cómo funciona cada práctica</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-5">
          {METHOD.map((m, i) => (
            <li key={m.t} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <span className="num text-sm font-bold text-cyan-300">{i + 1}</span>
              <div className="font-semibold text-white">{m.t}</div>
              <div className="text-xs text-slate-400">{m.d}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {PRACTICES.map((p, i) => {
          const Icon = ICON[p.id];
          const pr = progress[p.id] ?? 0;
          return (
            <motion.a
              key={p.id}
              href={`#/laboratorio/${p.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`panel group flex flex-col bg-gradient-to-br ${GRADIENT[p.id]} to-transparent p-5 transition-colors hover:border-white/20`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-lab-950/60 text-white">
                  <Icon size={24} aria-hidden />
                </span>
                <div className="flex flex-wrap justify-end gap-2 text-xs">
                  <span className="chip-tag border-white/15 text-slate-300">{p.level}</span>
                  <span className="chip-tag border-white/15 text-slate-300">
                    <Clock size={11} aria-hidden /> ~{p.minutes} min
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-cyan-300">Práctica {p.n}</div>
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-300">{p.objective}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.concepts.map((c) => (
                  <span key={c} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    {pr >= 1 ? <CheckCircle2 size={13} className="text-emerald-300" aria-hidden /> : <NotebookPen size={13} aria-hidden />}
                    {pr >= 1 ? 'Completada' : pr > 0 ? 'En progreso' : 'Sin empezar'}
                  </span>
                  <span className="num">{Math.round(pr * 100)} %</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(pr * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de la práctica ${p.n}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${pr * 100}%` }} />
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 font-semibold text-cyan-300">
                {pr > 0 ? 'Continuar' : 'Comenzar'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </motion.a>
          );
        })}
      </section>

      <p className="text-xs text-slate-500">
        Tu progreso se guarda en este navegador. Los instrumentos usan los mismos modelos documentados que el simulador; los datos que obtienes son simulados, no mediciones de equipos
        reales.
      </p>
    </div>
  );
}
