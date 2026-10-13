import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AMBIENT_RANGE, DEFAULT_SPEED, WORKLOADS } from '../data/thermalConfig';
import {
  advance,
  chipPower,
  createInitialState,
  steadyStateTemperature,
  temperatureRate,
  thermalStatus,
  timeConstant,
  totalCapacitance,
  totalResistance,
  type PowerBreakdown,
} from '../science/thermal';
import type { CoolingId, MaterialId, SimParams, SimState, WorkloadId } from '../types';

export interface SimDerived {
  power: PowerBreakdown;
  R: number;
  C: number;
  tau: number;
  /** dT/dt actual [K/s simulado]. */
  rate: number;
  steadyT: number;
  hotT: number;
  status: ReturnType<typeof thermalStatus>;
}

export interface SimActions {
  setLoad: (v: number) => void;
  setWorkload: (w: Exclude<WorkloadId, 'personalizado'>) => void;
  setAmbient: (v: number) => void;
  setCooling: (c: CoolingId) => void;
  setMaterial: (m: MaterialId) => void;
  setThrottling: (b: boolean) => void;
  setSpeed: (s: number) => void;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  /** Aplica varios parámetros de una vez (escenarios de presentación). */
  apply: (p: Partial<SimParams>, opts?: { reset?: boolean; startT?: number }) => void;
}

interface SimContextValue {
  params: SimParams;
  state: SimState;
  derived: SimDerived;
  actions: SimActions;
}

const SimContext = createContext<SimContextValue | null>(null);

export const DEFAULT_PARAMS: SimParams = {
  load: WORKLOADS[1].load,
  ambientC: AMBIENT_RANGE.default,
  cooling: 'ventilador',
  material: 'si',
  workload: 'normal',
  throttling: true,
  speed: DEFAULT_SPEED,
};

/** Frecuencia máxima de actualización de la interfaz [Hz]. */
const PUBLISH_HZ = 30;

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [state, setState] = useState<SimState>(() => ({ ...createInitialState(DEFAULT_PARAMS), running: true }));
  const paramsRef = useRef(params);
  const stateRef = useRef(state);
  paramsRef.current = params;

  const commit = useCallback((s: SimState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  // Bucle de simulación: el tiempo real se convierte en tiempo simulado.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastPublish = 0;
    const tick = (now: number) => {
      const dtReal = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      const s = stateRef.current;
      if (s.running && dtReal > 0) {
        const p = paramsRef.current;
        const next = advance(s, p, dtReal * p.speed);
        next.realElapsed = s.realElapsed + dtReal;
        stateRef.current = next;
        if (now - lastPublish >= 1000 / PUBLISH_HZ) {
          lastPublish = now;
          setState(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const update = useCallback((patch: Partial<SimParams>) => {
    setParams((p) => {
      const next = { ...p, ...patch };
      paramsRef.current = next;
      return next;
    });
  }, []);

  const actions = useMemo<SimActions>(
    () => ({
      setLoad: (v) => update({ load: v, workload: 'personalizado' }),
      setWorkload: (w) => update({ workload: w, load: WORKLOADS.find((x) => x.id === w)?.load ?? paramsRef.current.load }),
      setAmbient: (v) => update({ ambientC: v }),
      setCooling: (c) => update({ cooling: c }),
      setMaterial: (m) => update({ material: m }),
      setThrottling: (b) => update({ throttling: b }),
      setSpeed: (s) => update({ speed: s }),
      start: () => commit({ ...stateRef.current, running: true }),
      pause: () => commit({ ...stateRef.current, running: false }),
      toggle: () => commit({ ...stateRef.current, running: !stateRef.current.running }),
      reset: () => commit({ ...createInitialState(paramsRef.current), running: stateRef.current.running }),
      apply: (patch, opts) => {
        const next = { ...paramsRef.current, ...patch };
        paramsRef.current = next;
        setParams(next);
        if (opts?.reset) commit({ ...createInitialState(next, opts.startT ?? next.ambientC), running: true });
        else if (!stateRef.current.running) commit({ ...stateRef.current, running: true });
      },
    }),
    [update, commit],
  );

  const derived = useMemo<SimDerived>(() => {
    const R = totalResistance(params.cooling, params.material);
    const C = totalCapacitance(params.cooling, params.material);
    const power = chipPower(params.load, state.T, params.throttling);
    return {
      power,
      R,
      C,
      tau: timeConstant(params.cooling, params.material),
      rate: temperatureRate(state.T, params.ambientC, power.effective, R, C),
      steadyT: steadyStateTemperature(params),
      hotT: state.T + Math.max(0, ...state.coreDelta),
      status: thermalStatus(state.T),
    };
  }, [params, state.T, state.coreDelta]);

  const value = useMemo(() => ({ params, state, derived, actions }), [params, state, derived, actions]);
  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSimulation(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSimulation debe usarse dentro de <SimulationProvider>.');
  return ctx;
}
