import { memo, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { POWER } from '../../data/thermalConfig';
import type { SimSample } from '../../types';
import { fmt } from '../../utils/format';
import { CHART, downsample, tooltipStyle } from './chartTheme';

/** Potencia disipada frente al tiempo (eje propio: no se mezcla con temperatura). */
function PowerChartImpl({ history, height = 180 }: { history: SimSample[]; height?: number }) {
  const data = useMemo(() => downsample(history, 320), [history]);
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="pw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={CHART.power} stopOpacity={0.35} />
              <stop offset="1" stopColor={CHART.power} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(v: number) => `${Math.round(v)} s`} stroke={CHART.axis} tick={{ fontSize: 12 }} />
          <YAxis domain={[0, Math.ceil(POWER.maxW / 25) * 25]} tickFormatter={(v: number) => `${v} W`} stroke={CHART.axis} tick={{ fontSize: 12 }} width={58} />
          <Tooltip {...tooltipStyle} labelFormatter={(v: number) => `t simulado = ${fmt(v, 0)} s`} formatter={(v: number) => [`${fmt(v, 1)} W`, 'Potencia']} />
          <Area type="stepAfter" dataKey="P" name="Potencia" stroke={CHART.power} strokeWidth={2} fill="url(#pw)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const PowerChart = memo(PowerChartImpl);
