import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Cpu, Eye, Fan, FlaskConical, Maximize2, Minimize2, Pause, Play, Snowflake, Timer, Wind, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ChipVisual } from '../components/chip/ChipVisual';
import { ThermalScale } from '../components/chip/ThermalScale';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { BandComparison } from '../components/science/BandComparison';
import { STATUS_TONE } from '../components/sim/LiveIndicators';
import { Slider } from '../components/ui/Slider';
import { useSimulation } from '../context/SimulationContext';
import { MATERIAL_LIST, MATERIALS } from '../data/materials';
import { SCENARIOS } from '../data/scenarios';
import { COOLING, COOLING_LIST } from '../data/thermalConfig';
import { toKelvin } from '../science/constants';
import { DOPANTS } from '../science/doping';
import type { CoolingId, DopantId } from '../types';
import { temperatureTextColor } from '../utils/color';
import { clamp, fmt, fmtClock, fmtSci } from '../utils/format';
import { DopingVisuals, useDopingModel } from './DopingPage';

const COOL_ICON: Record<CoolingId, typeof Fan> = { pasiva: Wind, ventilador: Fan, avanzada: Snowflake };

function BigTemperature() {
  const { state, derived } = useSimulation();
  const c = temperatureTextColor(state.T);
  return (
    <div>
      <div className="text-lg text-slate-400">Temperatura del chip</div>
      <div className="num text-7xl font-bold leading-none xl:text-8xl" style={{ color: c, transition: 'color .4s' }}>
        {fmt(state.T, 1)}
        <span className="text-4xl text-slate-400"> °C</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-base">
        <span className={`chip-tag px-3 py-1 text-base ${STATUS_TONE[derived.status.tone]}`}>{derived.status.label}</span>
        <span className="chip-tag border-white/15 px-3 py-1 text-base text-slate-200">{fmt(derived.power.effective, 0)} W</span>
        {derived.power.factor < 0.999 && <span className="chip-tag border-red-400/40 bg-red-500/10 px-3 py-1 text-base text-red-200">Protección térmica activa</span>}
      </div>
      <div className="mt-4">
        <ThermalScale T={state.T} />
      </div>
    </div>
  );
}

function ChipControls() {
  const { params, actions } = useSimulation();
  return (
    <div className="space-y-4">
      <Slider label="Carga" value={Math.round(params.load * 100)} min={0} max={100} onChange={(v) => actions.setLoad(v / 100)} display={`${Math.round(params.load * 100)} %`} color="#f97316" large />
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Refrigeración">
        {COOLING_LIST.map((c) => {
          const Icon = COOL_ICON[c.id];
          const on = params.cooling === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => actions.setCooling(c.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-base font-semibold ${on ? 'border-cyan-400/70 bg-cyan-400/15 text-cyan-100' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
            >
              <Icon size={22} aria-hidden />
              {c.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MaterialsView() {
  const { state, params, actions } = useSimulation();
  const TK = toKelvin(state.T);
  return (
    <div className="panel p-4 xl:p-6">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold">Bandas a la misma escala, a {fmt(state.T, 0)} °C</h2>
        <span className="text-base text-slate-400">Toca un material para usarlo en el chip</span>
      </div>
      <BandComparison T={TK} selected={params.material} onSelect={actions.setMaterial} />
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        {MATERIAL_LIST.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={params.material === m.id}
            onClick={() => actions.setMaterial(m.id)}
            className={`rounded-xl border px-3 py-3 text-lg font-semibold ${params.material === m.id ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function DopingView() {
  const { state } = useSimulation();
  const [dopant, setDopant] = useState<DopantId>('fosforo');
  const T = clamp(Math.round(toKelvin(state.T)), 250, 600);
  const logN = 16;
  const { r } = useDopingModel(dopant, logN, T);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(DOPANTS) as DopantId[]).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={dopant === d}
            onClick={() => setDopant(d)}
            className={`rounded-xl border px-3 py-3 text-lg font-semibold ${dopant === d ? 'bg-white/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
            style={dopant === d ? { borderColor: DOPANTS[d].color } : undefined}
          >
            {DOPANTS[d].short}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="panel p-3">
          <DopingVisuals dopant={dopant} logN={logN} T={T} compact />
        </div>
        <div className="space-y-3">
          {[
            { label: 'Electrones libres n', value: r.n, role: r.majority === 'electrones' ? 'mayoritarios' : r.majority === 'huecos' ? 'minoritarios' : 'n = nᵢ', color: '#3987e5' },
            { label: 'Huecos p', value: r.p, role: r.majority === 'huecos' ? 'mayoritarios' : r.majority === 'electrones' ? 'minoritarios' : 'p = nᵢ', color: '#d95926' },
          ].map((x) => (
            <div key={x.label} className="panel p-4">
              <div className="flex items-center justify-between text-lg text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: x.color }} aria-hidden />
                  {x.label}
                </span>
                <span className="text-base text-slate-400">{x.role}</span>
              </div>
              <div className="num mt-1 text-4xl font-bold text-white">{fmtSci(x.value)} cm⁻³</div>
              <div className="mt-2 h-3 rounded-full bg-white/10">
                <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${clamp((Math.log10(x.value) / 18) * 100, 2, 100)}%`, background: x.color }} />
              </div>
            </div>
          ))}
          <div className="panel p-4 text-lg text-slate-200">
            {dopant === 'intrinseco'
              ? `Silicio puro a ${T} K: sólo pares generados térmicamente.`
              : `1 átomo de ${DOPANTS[dopant].symbol} por cada ${fmtSci(r.atomsPerDopant ?? 0, 1)} átomos de Si (10¹⁶ cm⁻³, ${T} K).`}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PresentationMode() {
  const { state, params, actions } = useSimulation();
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const sc = SCENARIOS[idx];

  const go = useCallback(
    (i: number) => {
      const n = clamp(i, 0, SCENARIOS.length - 1);
      setIdx(n);
      const s = SCENARIOS[n];
      if (s.params) actions.apply(s.params, { reset: s.reset });
    },
    [actions],
  );

  // Escenario A al entrar.
  useEffect(() => {
    go(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onFs = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    window.location.hash = '#/';
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowright' || k === 'pagedown') go(idx + 1);
      else if (k === 'arrowleft' || k === 'pageup') go(idx - 1);
      else if (k === ' ') {
        e.preventDefault();
        actions.toggle();
      } else if (k === 'f') toggleFull();
      else if (k === 'escape' && !document.fullscreenElement) exit();
      else {
        const n = '12345'.indexOf(k) >= 0 ? '12345'.indexOf(k) : 'abcde'.indexOf(k);
        if (n >= 0) go(n);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, idx, actions, toggleFull, exit]);

  const totalTarget = SCENARIOS.reduce((a, s) => a + s.seconds, 0);

  return (
    <div className="circuit-bg flex min-h-screen flex-col bg-lab-950">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-lab-950/90 px-4 py-3 backdrop-blur xl:px-8">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-500">
            <Cpu size={20} className="text-white" aria-hidden />
          </span>
          <span className="hidden font-display text-xl font-bold text-white md:block">ThermoChip Lab</span>
        </div>
        <nav className="order-last flex w-full flex-wrap justify-center gap-2 lg:order-none lg:w-auto lg:flex-1" aria-label="Escenarios">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-current={i === idx ? 'step' : undefined}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-base font-semibold transition-colors ${i === idx ? 'border-cyan-400 bg-cyan-400/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
            >
              <span className={`grid h-7 w-7 place-items-center rounded-lg font-mono ${i === idx ? 'bg-cyan-400 text-lab-950' : 'bg-white/10'}`}>{s.id}</span>
              <span className="hidden lg:inline">{s.short}</span>
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <span className="num flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300" title="Tiempo de exposición (real) / objetivo">
            <Timer size={15} aria-hidden /> {fmtClock(elapsed)} / {fmtClock(totalTarget)}
          </span>
          <button type="button" onClick={actions.toggle} className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10" aria-label={state.running ? 'Pausar' : 'Reanudar'}>
            {state.running ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
          </button>
          <button type="button" onClick={toggleFull} className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10" aria-label="Pantalla completa (F)">
            {isFull ? <Minimize2 size={18} aria-hidden /> : <Maximize2 size={18} aria-hidden />}
          </button>
          <button type="button" onClick={exit} className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10" aria-label="Salir del modo presentación (Esc)">
            <X size={18} aria-hidden />
          </button>
        </div>
      </header>

        <motion.main key={sc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex-1 space-y-5 p-4 xl:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-bold xl:text-5xl">
              <span className="mr-3 text-cyan-300">{sc.id}.</span>
              {sc.title}
            </h1>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost text-base" onClick={() => go(idx - 1)} disabled={idx === 0}>
                <ChevronLeft size={18} aria-hidden /> Anterior
              </button>
              <button type="button" className="btn-primary text-base" onClick={() => go(idx + 1)} disabled={idx === SCENARIOS.length - 1}>
                Siguiente <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              {sc.view === 'chip' && (
                <div className="grid items-center gap-6 lg:grid-cols-2">
                  <div className="mx-auto w-full max-w-[620px]">
                    <ChipVisual
                      T={state.T}
                      ambient={params.ambientC}
                      coreDelta={state.coreDelta}
                      load={params.load}
                      fanRps={COOLING[params.cooling].fanRps}
                      running={state.running}
                      materialLabel={MATERIALS[params.material].formula}
                    />
                  </div>
                  <div className="space-y-6">
                    <BigTemperature />
                    <ChipControls />
                  </div>
                </div>
              )}
              {sc.view === 'materials' && <MaterialsView />}
              {sc.view === 'doping' && <DopingView />}
            </div>

            <aside className="space-y-4 xl:col-span-4">
              <div className="panel p-5">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Eye size={20} className="text-cyan-300" aria-hidden /> Qué observar
                </h2>
                <ul className="mt-3 space-y-2 text-lg leading-snug text-slate-200">
                  {sc.observe.map((o) => (
                    <li key={o} className="flex gap-2">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" aria-hidden />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel-strong p-5">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <FlaskConical size={20} className="text-violet-300" aria-hidden /> ¿Qué está ocurriendo químicamente?
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-slate-200">{sc.chemistry}</p>
              </div>
              {sc.view !== 'chip' && (
                <div className="panel p-5">
                  <BigTemperature />
                </div>
              )}
            </aside>
          </div>

          {sc.view === 'chip' && (
            <div className="panel p-4 xl:p-6">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Temperatura frente al tiempo simulado</h2>
                <span className="num text-base text-slate-400">t = {fmtClock(state.t)} · ×{params.speed}</span>
              </div>
              <TemperatureChart history={state.history} height={300} big />
            </div>
          )}
        </motion.main>
      <footer className="px-4 pb-3 text-center text-xs text-slate-500 xl:px-8">
        Teclas: ← → escenario · 1–5 / A–E · Espacio pausa · F pantalla completa · Esc salir · Resultados simulados con parámetros supuestos
      </footer>
    </div>
  );
}
