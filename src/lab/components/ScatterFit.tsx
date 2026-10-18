import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, tooltipStyle } from '../../components/charts/chartTheme';
import type { LinearFit } from '../../science/stats';
import { fmt } from '../../utils/format';

interface Props {
  points: Array<{ x: number; y: number }>;
  fit: LinearFit | null;
  xLabel: string;
  yLabel: string;
  xDigits?: number;
  yDigits?: number;
  height?: number;
}

const DATA = '#3987e5';
const FIT = '#d95926';

/** Tus datos (puntos) y la recta de mejor ajuste por mínimos cuadrados. */
export function ScatterFit({ points, fit, xLabel, yLabel, xDigits = 1, yDigits = 1, height = 300 }: Props) {
  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const pad = (maxX - minX) * 0.06 || 1;
  const line = fit
    ? [minX - pad, maxX + pad].map((x) => ({ x, fit: fit.slope * x + fit.intercept }))
    : [];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 10, right: 20, bottom: 24, left: 10 }}>
          <CartesianGrid stroke={CHART.grid} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[minX - pad, maxX + pad]}
            tickFormatter={(v: number) => fmt(v, xDigits)}
            stroke={CHART.axis}
            tick={{ fontSize: 12 }}
            tickCount={7}
            label={{ value: xLabel, position: 'insideBottom', offset: -14, fill: '#cbd5e1', fontSize: 13 }}
          />
          <YAxis
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => fmt(v, yDigits)}
            stroke={CHART.axis}
            tick={{ fontSize: 12 }}
            width={64}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#cbd5e1', fontSize: 13, dx: 4 }}
          />
          <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [fmt(v, yDigits + 1), n]} labelFormatter={(v: number) => `${xLabel}: ${fmt(v, xDigits + 1)}`} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 6 }} />
          {fit && <Line data={line} dataKey="fit" name="Recta de ajuste" stroke={FIT} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />}
          <Scatter
            data={points.map((p) => ({ x: p.x, y: p.y }))}
            dataKey="y"
            name="Tus mediciones"
            fill={DATA}
            isAnimationActive={false}
            shape={(p: { cx?: number; cy?: number }) => <circle cx={p.cx} cy={p.cy} r={7} fill={DATA} stroke="#070d1f" strokeWidth={2} />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
