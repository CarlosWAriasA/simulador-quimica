import { motion } from 'framer-motion';
import { Activity, ArrowDownRight, ArrowUpRight, Gauge, Minus, Target, Thermometer, Timer, Zap } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { MATERIALS } from '../../data/materials';
import { toKelvin } from '../../science/constants';
import { bandgapVarshni, intrinsicConcentration } from '../../science/semiconductor';
import { temperatureTextColor } from '../../utils/color';
import { fmt, fmtSci } from '../../utils/format';
import { ThermalScale } from '../chip/ThermalScale';
import { DataTag } from '../ui/DataTag';
import { InfoTip } from '../ui/InfoTip';
import { Stat } from '../ui/Stat';

export const STATUS_TONE: Record<string, string> = {
  cool: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  ok: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  warm: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  hot: 'border-orange-500/50 bg-orange-500/15 text-orange-200',
  danger: 'border-red-500/60 bg-red-500/20 text-red-200',
};

/** Clasifica dT/dt en calentando / enfriando / estable. */
export function rateLabel(rate: number) {
  if (rate > 0.02) return { text: 'Calentando', icon: ArrowUpRight, color: '#fb923c' };
  if (rate < -0.02) return { text: 'Enfriando', icon: ArrowDownRight, color: '#38bdf8' };
  return { text: 'Estable', icon: Minus, color: '#34d399' };
}

/** Panel derecho: indicadores en tiempo real. */
export function LiveIndicators({ showMaterial = true }: { showMaterial?: boolean }) {
  const { state, params, derived } = useSimulation();
  const color = temperatureTextColor(state.T);
  const r = rateLabel(derived.rate);
  const RateIcon = r.icon;
  const TK = toKelvin(state.T);
  const m = MATERIALS[params.material];
  const niNow = intrinsicConcentration(m.id, TK);
  const niRef = intrinsicConcentration(m.id, toKelvin(25));

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/[0.07] bg-lab-950/60 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
            <Thermometer size={16} aria-hidden style={{ color }} /> Temperatura del chip
          </span>
          <DataTag kind="calculado" compact />
        </div>
        <div className="num mt-1 text-5xl font-bold tracking-tight sm:text-6xl" style={{ color, transition: 'color 0.4s' }} aria-live="off">
          {fmt(state.T, 1)}
          <span className="ml-1 text-2xl text-slate-400">°C</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <motion.span key={derived.status.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`chip-tag text-xs ${STATUS_TONE[derived.status.tone]}`}>
            {derived.status.label}
          </motion.span>
          <span className="chip-tag border-white/10 text-xs" style={{ color: r.color }}>
            <RateIcon size={13} aria-hidden /> {r.text}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">{derived.status.description}</p>
        <div className="mt-3">
          <ThermalScale T={state.T} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Ambiente" value={fmt(params.ambientC, 0)} unit="°C" icon={Thermometer} color="#7dd3fc" />
        <Stat label="Carga" value={Math.round(params.load * 100)} unit="%" icon={Gauge} color="#fdba74" />
        <Stat
          label="Potencia térmica"
          value={fmt(derived.power.effective, 1)}
          unit="W"
          icon={Zap}
          color="#fbbf24"
          kind="calculado"
          sub={derived.power.factor < 0.999 ? `Reducida al ${Math.round(derived.power.factor * 100)} % (protección)` : 'P = P_reposo + ΔP·carga'}
        />
        <Stat
          label="Ritmo dT/dt"
          value={`${derived.rate >= 0 ? '+' : ''}${fmt(derived.rate * 60, 1)}`}
          unit="°C/min"
          icon={Activity}
          color={r.color}
          kind="calculado"
          sub="por minuto simulado"
        />
        <Stat label="Punto más caliente" value={fmt(derived.hotT, 1)} unit="°C" icon={Target} color={temperatureTextColor(derived.hotT)} kind="conceptual" />
        <Stat label="Máxima alcanzada" value={fmt(state.Tmax, 1)} unit="°C" icon={Thermometer} color={temperatureTextColor(state.Tmax)} />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-lab-950/50 p-3 text-sm">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Timer size={14} aria-hidden /> Hacia dónde va
            <InfoTip>
              T∞ = T_amb + P·R es la temperatura de equilibrio con la potencia actual. τ = R·C indica la rapidez: tras un τ se recorre ~63 % del cambio.
            </InfoTip>
          </span>
          <DataTag kind="calculado" compact />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Equilibrio T∞</span>
          <span className="num font-semibold text-white">{fmt(derived.steadyT, 1)} °C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Constante de tiempo τ</span>
          <span className="num font-semibold text-white">{fmt(derived.tau, 0)} s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">R · C</span>
          <span className="num text-slate-300">
            {fmt(derived.R, 3)} K/W · {fmt(derived.C, 0)} J/K
          </span>
        </div>
      </div>

      {showMaterial && (
        <div className="rounded-xl border p-3 text-sm" style={{ borderColor: `${m.color}40`, background: `${m.color}0d` }}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} aria-hidden />
              {m.name} a {fmt(state.T, 0)} °C
            </span>
            <DataTag kind="calculado" compact />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Banda prohibida Eg(T)</span>
            <span className="num font-semibold text-white">{fmt(bandgapVarshni(m.id, TK), 3)} eV</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Portadores intrínsecos nᵢ</span>
            <span className="num font-semibold text-white">{fmtSci(niNow)} cm⁻³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">nᵢ respecto a 25 °C</span>
            <span className="num font-semibold" style={{ color: m.color }}>
              ×{fmtSci(niNow / niRef, 1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
