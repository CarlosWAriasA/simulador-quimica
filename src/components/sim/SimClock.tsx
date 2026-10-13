import { Pause, Play, RotateCcw } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { SPEED_OPTIONS } from '../../data/thermalConfig';
import { fmtClock } from '../../utils/format';

/** Reloj de simulación: tiempo simulado vs. tiempo real, y controles. */
export function SimClock({ compact = false, large = false }: { compact?: boolean; large?: boolean }) {
  const { state, params, actions } = useSimulation();
  return (
    <div className={`flex flex-wrap items-center gap-3 ${large ? 'text-lg' : ''}`}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={actions.toggle}
          className={state.running ? 'btn-ghost' : 'btn-primary'}
          aria-label={state.running ? 'Pausar simulación' : 'Iniciar simulación'}
        >
          {state.running ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          {state.running ? 'Pausar' : 'Iniciar'}
        </button>
        <button type="button" onClick={actions.reset} className="btn-ghost" aria-label="Reiniciar simulación">
          <RotateCcw size={16} aria-hidden />
          {!compact && 'Reiniciar'}
        </button>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-lab-950/60 px-3 py-1.5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Tiempo simulado</div>
          <div className={`num font-semibold text-white ${large ? 'text-2xl' : 'text-lg'}`}>{fmtClock(state.t)}</div>
        </div>
        {!compact && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tiempo real</div>
            <div className="num text-sm text-slate-400">{fmtClock(state.realElapsed)}</div>
          </div>
        )}
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="sr-only sm:not-sr-only">Velocidad</span>
          <select
            value={params.speed}
            onChange={(e) => actions.setSpeed(Number(e.target.value))}
            className="rounded-md border border-white/10 bg-lab-800 px-1.5 py-1 font-mono text-sm text-white"
            aria-label="Velocidad de simulación (segundos simulados por segundo real)"
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s} value={s}>
                ×{s}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
