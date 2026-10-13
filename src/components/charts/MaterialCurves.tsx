import { memo, useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MATERIAL_LIST } from '../../data/materials';
import { bandgapVarshni, intrinsicConcentration } from '../../science/semiconductor';
import type { MaterialId } from '../../types';
import { fmt, fmtSci } from '../../utils/format';
import { CHART, tooltipStyle } from './chartTheme';

const T_MIN = 200;
const T_MAX = 600;
const DEFAULT_IDS: MaterialId[] = ['si', 'ge', 'gaas'];

type Row = { T: number } & Partial<Record<MaterialId, number>>;

function buildRows(fn: (m: MaterialId, T: number) => number, ids: MaterialId[]): Row[] {
  const rows: Row[] = [];
  for (let T = T_MIN; T <= T_MAX; T += 10) {
    const r: Row = { T };
    ids.forEach((id) => (r[id] = fn(id, T)));
    rows.push(r);
  }
  return rows;
}

interface CurveProps {
  kind: 'eg' | 'ni';
  currentT?: number;
  highlight?: MaterialId;
  ids?: MaterialId[];
  height?: number;
}

/** Curvas calculadas Eg(T) (Varshni) o nᵢ(T) (escala logarítmica) para varios materiales. */
function MaterialCurvesImpl({ kind, currentT, highlight, ids = DEFAULT_IDS, height = 280 }: CurveProps) {
  const data = useMemo(() => buildRows(kind === 'eg' ? bandgapVarshni : intrinsicConcentration, ids), [kind, ids]);
  const mats = MATERIAL_LIST.filter((m) => ids.includes(m.id));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 22, right: 16, bottom: 6, left: 6 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="T" type="number" domain={[T_MIN, T_MAX]} tickFormatter={(v: number) => `${v} K`} stroke={CHART.axis} tick={{ fontSize: 12 }} tickCount={5} />
          {kind === 'eg' ? (
            <YAxis domain={[0.4, 1.6]} tickFormatter={(v: number) => `${fmt(v, 1)} eV`} stroke={CHART.axis} tick={{ fontSize: 12 }} width={62} />
          ) : (
            <YAxis
              scale="log"
              domain={[1, 1e18]}
              ticks={[1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18]}
              tickFormatter={(v: number) => fmtSci(v, 0)}
              stroke={CHART.axis}
              tick={{ fontSize: 12 }}
              width={72}
              allowDataOverflow
            />
          )}
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v: number) => `T = ${v} K (${fmt(v - 273.15, 0)} °C)`}
            formatter={(v: number, name: string) => [kind === 'eg' ? `${fmt(v, 3)} eV` : `${fmtSci(v, 2)} cm⁻³`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {currentT !== undefined && <ReferenceLine x={Math.round(currentT)} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: 'T actual', fill: '#e2e8f0', fontSize: 11, position: 'top' }} />}
          {mats.map((m) => (
            <Line
              key={m.id}
              type="monotone"
              dataKey={m.id}
              name={m.formula}
              stroke={m.color}
              strokeWidth={highlight === m.id ? 3.5 : 2}
              strokeOpacity={highlight && highlight !== m.id ? 0.55 : 1}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const MaterialCurves = memo(MaterialCurvesImpl);
