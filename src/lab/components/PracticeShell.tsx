import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Download, FlaskConical, Lightbulb, ListChecks, Microscope, Printer, RotateCcw, Target, Wrench } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { RefCite } from '../../components/ui/RefCite';
import { downloadText, toCsv } from '../../utils/csv';
import { PROJECT } from '../../data/project';
import type { RecordUpdate } from '../storage';
import type { PracticeDef, PracticeRecord } from '../types';
import { ChoiceQuestion } from './ChoiceQuestion';
import { DataTable, formatCell } from './DataTable';

const STEPS = [
  { label: 'Objetivo e hipótesis', icon: Lightbulb },
  { label: 'Experimento', icon: FlaskConical },
  { label: 'Análisis', icon: Microscope },
  { label: 'Preguntas', icon: ListChecks },
  { label: 'Informe', icon: ClipboardCheck },
];

interface Props {
  def: PracticeDef;
  rec: PracticeRecord;
  update: (u: RecordUpdate) => void;
  reset: () => void;
  /** Banco de trabajo con los instrumentos (paso 2). */
  bench: ReactNode;
  /** Análisis de los datos del estudiante (paso 3). */
  analysis: ReactNode;
  /** Resultado principal para el informe. */
  summary: ReactNode;
}

export function PracticeShell({ def, rec, update, reset, bench, analysis, summary }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const step = Math.min(rec.step, STEPS.length - 1);
  const go = (s: number) => {
    update({ step: Math.max(0, Math.min(STEPS.length - 1, s)) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const enoughData = rec.rows.length >= def.minRows;
  const answered = def.questions.filter((q) => rec.answers[q.id]).length;
  const score = def.questions.filter((q) => rec.answers[q.id] === q.correct).length;
  const done = [Boolean(rec.hypothesis), enoughData, enoughData, answered === def.questions.length, rec.conclusion.trim().length > 20];
  const hypOk = rec.hypothesis === def.hypothesis.correct;

  const exportCsv = () => {
    const header = def.columns.map((c) => (c.unit ? `${c.label} [${c.unit}]` : c.label));
    const rows = rec.rows.map((r) => def.columns.map((c) => r[c.key] ?? ''));
    downloadText(`practica_${def.n}_datos_simulados.csv`, toCsv(header, [[`Práctica ${def.n}: ${def.title} — datos obtenidos en el laboratorio virtual ThermoChip Lab (simulados)`], ...rows]));
  };

  return (
    <div className="space-y-6">
      <header className="no-print flex flex-col gap-4">
        <a href="#/laboratorio" className="inline-flex w-fit items-center gap-1 text-sm text-slate-400 hover:text-cyan-300">
          <ArrowLeft size={14} aria-hidden /> Volver al laboratorio
        </a>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Práctica {def.n} · {def.level} · ~{def.minutes} min
            </div>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{def.title}</h1>
          </div>
        </div>
        <nav aria-label="Pasos de la práctica" className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => go(i)}
                aria-current={active ? 'step' : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-semibold transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:px-3 sm:text-sm ${
                  active ? 'border-cyan-400/70 bg-cyan-400/10 text-white' : 'border-white/[0.07] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${done[i] ? 'bg-emerald-400 text-lab-950' : active ? 'bg-cyan-400 text-lab-950' : 'bg-white/10'}`}>
                  {done[i] ? <Check size={14} aria-hidden /> : <Icon size={13} aria-hidden />}
                </span>
                <span className="text-center leading-tight">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {step === 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="panel space-y-4 p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Target size={20} className="text-cyan-300" aria-hidden /> Objetivo
            </h2>
            <p className="text-base leading-relaxed text-slate-200">{def.objective}</p>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Conceptos</h3>
              <div className="flex flex-wrap gap-2">
                {def.concepts.map((c) => (
                  <span key={c} className="chip-tag border-violet-400/30 bg-violet-400/10 px-3 py-1 text-sm text-violet-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <Wrench size={14} aria-hidden /> Materiales e instrumentos (virtuales)
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {def.instruments.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Procedimiento</h3>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-200">
                {def.procedure.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
            <p className="text-xs text-slate-500">
              Fundamento: <RefCite ids={def.refs} />
            </p>
          </section>
          <section className="space-y-4">
            <div className="panel-strong p-5">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Lightbulb size={20} className="text-amber-300" aria-hidden /> Tu hipótesis
              </h2>
              <p className="mt-1 text-sm text-slate-400">Antes de experimentar, haz una predicción. No hay penalización: al final la compararás con tus resultados.</p>
            </div>
            <ChoiceQuestion q={def.hypothesis} value={rec.hypothesis} onChange={(id) => update({ hypothesis: id })} reveal={false} />
            <button type="button" className="btn-primary w-full text-base" disabled={!rec.hypothesis} onClick={() => go(1)}>
              Ir al banco de trabajo <ArrowRight size={18} aria-hidden />
            </button>
            {!rec.hypothesis && <p className="text-center text-xs text-slate-500">Elige una opción para continuar.</p>}
          </section>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          {bench}
          <DataTable
            columns={def.columns}
            rows={rec.rows}
            minRows={def.minRows}
            onDelete={(i) => update((r) => ({ rows: r.rows.filter((_, k) => k !== i) }))}
            onClear={() => update({ rows: [] })}
          />
          <div className="flex justify-end">
            <button type="button" className="btn-primary text-base" disabled={!enoughData} onClick={() => go(2)}>
              Analizar mis datos <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {enoughData ? (
            analysis
          ) : (
            <div className="panel p-6 text-center">
              <p className="text-lg text-slate-200">
                Necesitas al menos {def.minRows} mediciones para analizar (tienes {rec.rows.length}).
              </p>
              <button type="button" className="btn-primary mt-4" onClick={() => go(1)}>
                <ArrowLeft size={16} aria-hidden /> Volver al experimento
              </button>
            </div>
          )}
          {enoughData && (
            <div className="flex justify-between">
              <button type="button" className="btn-ghost" onClick={() => go(1)}>
                <ArrowLeft size={16} aria-hidden /> Tomar más datos
              </button>
              <button type="button" className="btn-primary" onClick={() => go(3)}>
                Responder preguntas <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {def.questions.map((q, i) => (
            <ChoiceQuestion
              key={q.id}
              index={i + 1}
              q={q}
              value={rec.answers[q.id]}
              onChange={(id) => update((r) => ({ answers: { ...r.answers, [q.id]: id } }))}
              reveal={Boolean(rec.answers[q.id])}
            />
          ))}
          <div className="flex justify-between">
            <button type="button" className="btn-ghost" onClick={() => go(2)}>
              <ArrowLeft size={16} aria-hidden /> Análisis
            </button>
            <button type="button" className="btn-primary" onClick={() => go(4)}>
              Escribir informe <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="print-area panel space-y-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Informe de laboratorio · ThermoChip Lab</div>
              <h2 className="mt-1 text-2xl font-bold">
                Práctica {def.n}: {def.title}
              </h2>
              <p className="text-sm text-slate-400">
                {PROJECT.course} · {PROJECT.university} · {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
            <label className="no-print block text-sm text-slate-300">
              Nombre(s)
              <input
                value={String(rec.extra.alumno ?? '')}
                onChange={(e) => update((r) => ({ extra: { ...r.extra, alumno: e.target.value } }))}
                className="mt-1 block w-64 rounded-lg border border-white/10 bg-lab-800 px-3 py-2 text-white"
                placeholder="Integrantes del equipo"
              />
            </label>
            {rec.extra.alumno && <p className="print-only text-sm">Integrantes: {String(rec.extra.alumno)}</p>}
          </div>

          <section>
            <h3 className="text-lg font-semibold">1. Objetivo</h3>
            <p className="mt-1 text-slate-300">{def.objective}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. Hipótesis</h3>
            <p className="mt-1 text-slate-300">{def.hypothesis.text}</p>
            <p className="mt-2 text-slate-200">
              Predicción: <strong>{def.hypothesis.options.find((o) => o.id === rec.hypothesis)?.text ?? 'sin respuesta'}</strong>
            </p>
            <p className={`mt-2 rounded-xl p-3 text-sm ${hypOk ? 'bg-emerald-400/10 text-emerald-100' : 'bg-amber-400/10 text-amber-100'}`}>
              {hypOk ? 'Los resultados confirman la hipótesis. ' : 'Los resultados no confirman la hipótesis: ¡eso también es aprendizaje! '}
              {def.hypothesis.explanation}
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-semibold">3. Datos obtenidos</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-slate-400">
                  {def.columns.map((c) => (
                    <th key={c.key} className="py-1.5 pr-3">
                      {c.label}
                      {c.unit ? ` [${c.unit}]` : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="num divide-y divide-white/5">
                {rec.rows.map((r, i) => (
                  <tr key={i}>
                    {def.columns.map((c) => (
                      <td key={c.key} className="py-1.5 pr-3">
                        {formatCell(c, r[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-xs text-slate-500">Datos obtenidos en un laboratorio virtual (modelo simulado), no mediciones de equipos reales.</p>
          </section>

          <section>
            <h3 className="mb-2 text-lg font-semibold">4. Resultados y análisis</h3>
            {enoughData ? summary : <p className="text-slate-400">Datos insuficientes para el análisis.</p>}
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. Cuestionario</h3>
            <p className="mt-1 text-slate-300">
              Respuestas correctas: <strong className="num text-white">{score}</strong> de {def.questions.length}
              {answered < def.questions.length && ` (sin responder: ${def.questions.length - answered})`}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Conclusión</h3>
            <textarea
              value={rec.conclusion}
              onChange={(e) => update({ conclusion: e.target.value })}
              rows={5}
              className="no-print mt-2 w-full rounded-xl border border-white/10 bg-lab-800 p-3 text-sm text-white placeholder:text-slate-500"
              placeholder="Escribe con tus palabras qué descubriste, si se cumplió tu hipótesis y qué relación tiene con la química de los semiconductores…"
            />
            <p className="print-only whitespace-pre-wrap">{rec.conclusion || '—'}</p>
          </section>

          <div className="no-print flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              <Printer size={16} aria-hidden /> Imprimir / guardar PDF
            </button>
            <button type="button" className="btn-ghost" onClick={exportCsv} disabled={rec.rows.length === 0}>
              <Download size={16} aria-hidden /> Datos en CSV
            </button>
            {!confirmReset ? (
              <button type="button" className="btn-ghost ml-auto" onClick={() => setConfirmReset(true)}>
                <RotateCcw size={16} aria-hidden /> Repetir práctica
              </button>
            ) : (
              <span className="ml-auto flex items-center gap-2 text-sm text-slate-300">
                ¿Borrar datos y respuestas?
                <button type="button" className="btn-ghost border-red-400/40 text-red-200" onClick={() => { reset(); setConfirmReset(false); }}>
                  Sí, borrar
                </button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>
                  Cancelar
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
