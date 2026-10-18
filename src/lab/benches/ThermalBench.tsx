import { motion } from 'framer-motion';
import { Clock, Fan, NotebookPen, RotateCcw, Snowflake, Thermometer, Wind, Zap } from 'lucide-react';
import { ChipVisual } from '../../components/chip/ChipVisual';
import { Slider } from '../../components/ui/Slider';
import { COOLING, COOLING_LIST } from '../../data/thermalConfig';
import type { CoolingId } from '../../types';
import { fmt, fmtClock } from '../../utils/format';
import { Instrument } from '../components/Instrument';
import type { useLocalThermal } from '../useLocalThermal';

const COOL_ICON: Record<CoolingId, typeof Fan> = { pasiva: Wind, ventilador: Fan, avanzada: Snowflake };
const LAB_SPEEDS = [10, 50, 100];

interface Props {
  bench: ReturnType<typeof useLocalThermal>;
  lockLoad?: boolean;
  lockCooling?: boolean;
  onRecord: () => void;
  /** Mensaje breve tras registrar. */
  flash?: string | null;
}

/** Banco de pruebas térmicas: chip, termómetro, vatímetro y controles. */
export function ThermalBench({ bench, lockLoad, lockCooling, onRecord, flash }: Props) {
  const { params, setParams, state, power, stable, rate, reset } = bench;
  return (
    <section className="panel-strong overflow-hidden" aria-label="Banco de trabajo">
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative">
          <div className="circuit-bg absolute inset-0 rounded-2xl opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-[420px]">
            <ChipVisual T={state.T} ambient={params.ambientC} coreDelta={state.coreDelta} load={params.load} fanRps={COOLING[params.cooling].fanRps} running={state.running} materialLabel="Si" />
          </div>
          <p className="relative mt-1 text-center text-xs text-slate-400">Chip de prueba · ambiente {fmt(params.ambientC, 0)} °C</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
            <Instrument
              large
              label="Termómetro"
              icon={Thermometer}
              value={fmt(state.T, 1)}
              unit="°C"
              led={{ on: stable, label: stable ? 'Estable' : 'Cambiando…' }}
              hint={stable ? 'Lectura de equilibrio' : `${rate > 0 ? 'Subiendo' : 'Bajando'} ${fmt(Math.abs(rate) * 60, 1)} °C/min`}
            />
            </div>
            <Instrument label="Vatímetro" icon={Zap} value={fmt(power, 1)} unit="W" hint="Potencia disipada por el chip" />
            <Instrument label="Reloj" icon={Clock} value={fmtClock(state.t)} hint="Tiempo simulado" />
          </div>

          {!lockLoad && (
            <Slider
              label="Carga del procesador"
              value={Math.round(params.load * 100)}
              min={0}
              max={100}
              step={5}
              onChange={(v) => setParams({ load: v / 100 })}
              display={`${Math.round(params.load * 100)} %`}
              color="#f97316"
              minLabel="0 %"
              maxLabel="100 %"
              large
            />
          )}
          {lockLoad && <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">Carga fija: <strong className="text-white">{Math.round(params.load * 100)} %</strong> · protección térmica desactivada (chip de prueba).</p>}

          {!lockCooling && (
            <div>
              <div className="mb-1.5 text-sm font-medium text-slate-300">Sistema de refrigeración</div>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Sistema de refrigeración">
                {COOLING_LIST.map((c) => {
                  const Icon = COOL_ICON[c.id];
                  const on = params.cooling === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setParams({ cooling: c.id })}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-semibold ${on ? 'border-cyan-400/70 bg-cyan-400/15 text-cyan-50' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
                    >
                      <Icon size={20} aria-hidden />
                      {c.short}
                      <span className="text-[11px] font-normal text-slate-400">{c.auxPowerW} W</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {lockCooling && <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">Refrigeración fija: <strong className="text-white">{COOLING[params.cooling].label}</strong>.</p>}

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              onClick={onRecord}
              whileTap={{ scale: 0.96 }}
              className={`btn text-base ${stable ? 'bg-emerald-400 text-lab-950 hover:bg-emerald-300' : 'bg-amber-300 text-lab-950 hover:bg-amber-200'}`}
            >
              <NotebookPen size={18} aria-hidden /> Registrar medición
            </motion.button>
            <button type="button" className="btn-ghost" onClick={reset}>
              <RotateCcw size={16} aria-hidden /> Enfriar y reiniciar
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-400">
              Velocidad
              <select
                value={params.speed}
                onChange={(e) => setParams({ speed: Number(e.target.value) })}
                className="rounded-md border border-white/10 bg-lab-800 px-2 py-1.5 font-mono text-white"
                aria-label="Velocidad del tiempo simulado"
              >
                {LAB_SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    ×{s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!stable && <p className="text-xs text-amber-200/80">Consejo: espera a que el termómetro marque «Estable» antes de registrar.</p>}
          {flash && (
            <motion.p key={flash} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-emerald-300" role="status">
              {flash}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
