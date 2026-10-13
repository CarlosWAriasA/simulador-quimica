import { motion } from 'framer-motion';
import { ArrowRight, Atom, BarChart3, FlaskConical, Leaf, Microscope, Presentation, Thermometer, Zap } from 'lucide-react';
import { ChipVisual } from '../components/chip/ChipVisual';
import { STATUS_TONE } from '../components/sim/LiveIndicators';
import { SimClock } from '../components/sim/SimClock';
import { Segmented } from '../components/ui/Segmented';
import { Slider } from '../components/ui/Slider';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { useSimulation } from '../context/SimulationContext';
import { MATERIALS } from '../data/materials';
import { COOLING, COOLING_LIST } from '../data/thermalConfig';
import type { CoolingId } from '../types';
import { temperatureTextColor } from '../utils/color';
import { fmt } from '../utils/format';

const MODULES = [
  { href: '#/simulador', icon: Thermometer, title: 'Simulador térmico', text: 'Carga, refrigeración y temperatura en tiempo real con C·dT/dt = P − ΔT/R.', color: 'from-orange-500/20' },
  { href: '#/quimica', icon: Atom, title: 'Química de semiconductores', text: 'Enlaces, bandas de energía y electrones excitados por la temperatura.', color: 'from-violet-500/20' },
  { href: '#/dopaje', icon: FlaskConical, title: 'Dopaje químico', text: 'Silicio tipo N con fósforo y tipo P con boro, átomo por átomo.', color: 'from-cyan-500/20' },
  { href: '#/comparador', icon: BarChart3, title: 'Comparador', text: 'Si, Ge, GaAs y perovskitas: datos publicados lado a lado.', color: 'from-sky-500/20' },
  { href: '#/nanomateriales', icon: Microscope, title: 'Nanomateriales y TIC', text: 'Puntos cuánticos, FinFET, celdas solares y qubits.', color: 'from-emerald-500/20' },
  { href: '#/resultados', icon: Leaf, title: 'Resultados y sostenibilidad', text: 'Energía, durabilidad, costos, e-waste y exportación CSV.', color: 'from-lime-500/20' },
];

const QUESTIONS = [
  { q: '¿Qué ocurre con la temperatura cuando aumenta la carga?', href: '#/simulador' },
  { q: '¿Qué ocurre con los electrones al calentar el material?', href: '#/quimica' },
  { q: '¿Cómo cambia el dopaje la concentración de portadores?', href: '#/dopaje' },
  { q: '¿En qué se diferencian Si, Ge y GaAs?', href: '#/comparador' },
  { q: '¿Por qué importa el tamaño nanométrico?', href: '#/nanomateriales' },
  { q: '¿La refrigeración avanzada siempre ahorra energía?', href: '#/resultados' },
];

export function DashboardPage() {
  const { state, params, derived, actions } = useSimulation();
  const color = temperatureTextColor(state.T);

  return (
    <div className="space-y-8">
      <section className="circuit-bg relative overflow-hidden rounded-3xl border border-white/[0.07] bg-lab-900/60 p-5 sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4 xl:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              <Zap size={13} aria-hidden /> Nanomateriales y semiconductores
            </div>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl xl:text-[2.6rem] 2xl:text-5xl">
              Un chip que <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-orange-300 bg-clip-text text-transparent">se calienta</span> y la química que lo explica.
            </h1>
            <p className="text-base leading-relaxed text-slate-300">
              Cambia la carga y la refrigeración, observa cómo evoluciona la temperatura y descubre qué les ocurre a los electrones dentro del silicio, el germanio y el arseniuro de galio.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#/simulador" className="btn-primary">
                Abrir simulador <ArrowRight size={16} aria-hidden />
              </a>
              <a href="#/presentacion" className="btn-ghost">
                <Presentation size={16} aria-hidden /> Modo presentación
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[580px] lg:col-span-4 xl:col-span-6">
            <ChipVisual T={state.T} ambient={params.ambientC} coreDelta={state.coreDelta} load={params.load} fanRps={COOLING[params.cooling].fanRps} running={state.running} materialLabel={MATERIALS[params.material].formula} />
          </div>

          <div className="space-y-4 lg:col-span-4 xl:col-span-3">
            <div className="rounded-2xl border border-white/[0.07] bg-lab-950/60 p-4">
              <div className="text-sm text-slate-400">Temperatura del chip</div>
              <div className="num text-6xl font-bold" style={{ color, transition: 'color .4s' }}>
                {fmt(state.T, 1)}
                <span className="text-2xl text-slate-400"> °C</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className={`chip-tag ${STATUS_TONE[derived.status.tone]}`}>{derived.status.label}</span>
                <span className="chip-tag border-white/10 text-slate-300">{fmt(derived.power.effective, 0)} W</span>
                <span className="chip-tag border-white/10 text-slate-300">Equilibrio ≈ {fmt(derived.steadyT, 0)} °C</span>
              </div>
            </div>
            <Slider
              label="Carga del procesador"
              value={Math.round(params.load * 100)}
              min={0}
              max={100}
              onChange={(v) => actions.setLoad(v / 100)}
              display={`${Math.round(params.load * 100)} %`}
              color="#f97316"
            />
            <Segmented<CoolingId> label="Refrigeración" value={params.cooling} onChange={actions.setCooling} options={COOLING_LIST.map((c) => ({ value: c.id, label: c.short }))} />
            <SimClock compact />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="panel p-4 sm:p-5 lg:col-span-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Evolución de la temperatura</h2>
            <span className="text-xs text-slate-400">Resultado simulado · tiempo simulado</span>
          </div>
          <TemperatureChart history={state.history} height={260} showHot={false} />
        </div>
        <div className="panel p-4 sm:p-5 lg:col-span-4">
          <h2 className="text-lg font-semibold">Preguntas que responde el laboratorio</h2>
          <ul className="mt-3 space-y-1.5">
            {QUESTIONS.map((x) => (
              <li key={x.q}>
                <a href={x.href} className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">
                  {x.q}
                  <ArrowRight size={15} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-300" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Módulos del laboratorio</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.a
                key={m.href}
                href={m.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`panel group relative overflow-hidden bg-gradient-to-br ${m.color} to-transparent p-5 transition-colors hover:border-white/20`}
              >
                <Icon size={24} className="text-white" aria-hidden />
                <h3 className="mt-3 text-lg font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{m.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
                  Explorar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </motion.a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
