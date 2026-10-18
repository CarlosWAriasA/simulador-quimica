import { useCallback, useEffect, useRef, useState } from 'react';
import { chipPower, createInitialState, advance, systemRate } from '../science/thermal';
import type { SimParams, SimState } from '../types';

/** dT/dt por debajo del cual el termómetro se considera estable [K/s simulado]. */
export const STABLE_RATE = 0.003;

/**
 * Banco térmico independiente para las prácticas: mismo modelo que el
 * simulador, pero con su propio estado (no altera el chip del modo libre).
 */
export function useLocalThermal(initial: SimParams) {
  const [params, setParamsState] = useState<SimParams>(initial);
  const paramsRef = useRef(params);
  const [state, setState] = useState<SimState>(() => ({ ...createInitialState(initial), running: true }));
  const stateRef = useRef(state);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastPublish = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      const s = stateRef.current;
      if (s.running && dt > 0) {
        const next = advance(s, paramsRef.current, dt * paramsRef.current.speed);
        next.realElapsed = s.realElapsed + dt;
        stateRef.current = next;
        if (now - lastPublish > 50) {
          lastPublish = now;
          setState(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setParams = useCallback((patch: Partial<SimParams>) => {
    const next = { ...paramsRef.current, ...patch };
    paramsRef.current = next;
    setParamsState(next);
  }, []);

  const reset = useCallback(() => {
    const s = { ...createInitialState(paramsRef.current), running: true };
    stateRef.current = s;
    setState(s);
  }, []);

  const rate = systemRate(state.T, params);
  const power = chipPower(params.load, state.T, params.throttling).effective;
  return { params, setParams, state, rate, power, stable: Math.abs(rate) < STABLE_RATE, reset };
}
