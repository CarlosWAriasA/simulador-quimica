import { memo, useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DOPING_T_RANGE_K, siliconCarriers } from '../../science/doping';
import type { DopantId } from '../../types';
import { fmt, fmtSci } from '../../utils/format';
import { CHART, tooltipStyle } from './chartTheme';

const ELECTRON = '#3987e5';
const HOLE = '#d95926';
const NEUTRAL = '#94a3b8';

function rows(dopant: DopantId, N: number) {
  const out = [];
  for (let T = DOPING_T_RANGE_K.min; T <= DOPING_T_RANGE_K.max; T += 10) {
    const r = siliconCarriers(dopant, N, T);
    const i = siliconCarriers('intrinseco', 0, T);
    out.push({ T, n: r.n, p: r.p, ni: r.ni, sigma: r.sigma, sigmaI: i.sigma });
  }
  return out;
}

const logTicks = (lo: number, hi: number, step: number) => {
  const t: number[] = [];
  for (let e = lo; e <= hi; e += step) t.push(10 ** e);
  return t;
};

/** n(T), p(T) y nᵢ(T) del silicio dopado (escala logarítmica). */
export const CarrierChart = memo(function CarrierChart({ dopant, N, T }: { dopant: DopantId; N: number; T: number }) {
  const data = useMemo(() => rows(dopant, N), [dopant, N]);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 6, left: 6 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="T" type="number" domain={[DOPING_T_RANGE_K.min, DOPING_T_RANGE_K.max]} tickFormatter={(v: number) => `${v} K`} stroke={CHART.axis} tick={{ fontSize: 12 }} />
          <YAxis scale="log" domain={[1, 1e19]} ticks={logTicks(0, 18, 3)} tickFormatter={(v: number) => fmtSci(v, 0)} stroke={CHART.axis} tick={{ fontSize: 12 }} width={72} allowDataOverflow />
          <Tooltip {...tooltipStyle} labelFormatter={(v: number) => `T = ${v} K`} formatter={(v: number, name: string) => [`${fmtSci(v, 2)} cm⁻³`, name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine x={Math.round(T / 10) * 10} stroke="#e2e8f0" strokeDasharray="4 4" />
          <Line dataKey="n" name="Electrones n" stroke={ELECTRON} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line dataKey="p" name="Huecos p" stroke={HOLE} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line dataKey="ni" name="Intrínseca nᵢ" stroke={NEUTRAL} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

/** Conductividad del Si intrínseco frente al dopado: la tendencia con T no es universal. */
export const ConductivityChart = memo(function ConductivityChart({ dopant, N }: { dopant: DopantId; N: number }) {
  const data = useMemo(() => rows(dopant, N), [dopant, N]);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 6, left: 6 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="T" type="number" domain={[DOPING_T_RANGE_K.min, DOPING_T_RANGE_K.max]} tickFormatter={(v: number) => `${v} K`} stroke={CHART.axis} tick={{ fontSize: 12 }} />
          <YAxis scale="log" domain={[1e-9, 1e3]} ticks={logTicks(-9, 3, 2)} tickFormatter={(v: number) => fmtSci(v, 0)} stroke={CHART.axis} tick={{ fontSize: 12 }} width={72} allowDataOverflow />
          <Tooltip {...tooltipStyle} labelFormatter={(v: number) => `T = ${v} K (${fmt(v - 273.15, 0)} °C)`} formatter={(v: number, name: string) => [`${fmtSci(v, 2)} S/cm`, name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="sigmaI" name="Si intrínseco" stroke={NEUTRAL} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
          {dopant !== 'intrinseco' && <Line dataKey="sigma" name={`Si dopado (${fmtSci(N, 0)} cm⁻³)`} stroke={dopant === 'fosforo' ? ELECTRON : HOLE} strokeWidth={2.5} dot={false} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
