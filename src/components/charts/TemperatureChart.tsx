import { memo, useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TJ_MAX } from '../../data/thermalConfig';
import type { SimSample } from '../../types';
import { fmt } from '../../utils/format';
import { CHART, downsample, tooltipStyle } from './chartTheme';

interface Props {
  history: SimSample[];
  height?: number;
  showHot?: boolean;
  big?: boolean;
}

function TemperatureChartImpl({ history, height = 300, showHot = true, big = false }: Props) {
  const data = useMemo(() => downsample(history, 320), [history]);
  const useMinutes = (history[history.length - 1]?.t ?? 0) > 300;
  const maxT = Math.max(TJ_MAX + 5, ...data.map((d) => d.Thot));
  const fs = big ? 15 : 12;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v: number) => (useMinutes ? `${fmt(v / 60, 0)} min` : `${Math.round(v)} s`)}
            stroke={CHART.axis}
            tick={{ fontSize: fs }}
            tickCount={6}
          />
          <YAxis
            domain={[(min: number) => Math.floor(Math.min(min, 20) / 10) * 10, Math.ceil(maxT / 10) * 10]}
            tickFormatter={(v: number) => `${v} °C`}
            stroke={CHART.axis}
            tick={{ fontSize: fs }}
            width={big ? 70 : 58}
            allowDataOverflow
          />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v: number) => `t simulado = ${fmt(v, 0)} s`}
            formatter={(value: number, name: string) => [`${fmt(value, 1)} °C`, name]}
          />
          <Legend wrapperStyle={{ fontSize: fs, paddingTop: 4 }} />
          <ReferenceLine
            y={TJ_MAX}
            stroke={CHART.limit}
            strokeDasharray="6 4"
            label={{ value: `Límite de diseño ${TJ_MAX} °C`, fill: '#fca5a5', fontSize: fs - 1, position: 'insideTopLeft' }}
          />
          <Line type="monotone" dataKey="T" name="Chip (media)" stroke={CHART.chip} strokeWidth={big ? 3.5 : 2.5} dot={false} isAnimationActive={false} />
          {showHot && (
            <Line type="monotone" dataKey="Thot" name="Punto caliente" stroke={CHART.chip} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          )}
          <Line type="stepAfter" dataKey="ambientC" name="Ambiente" stroke={CHART.ambient} strokeWidth={2} strokeDasharray="2 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const TemperatureChart = memo(TemperatureChartImpl);
