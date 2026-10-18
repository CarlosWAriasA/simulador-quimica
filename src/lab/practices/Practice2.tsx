import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, tooltipStyle } from '../../components/charts/chartTheme';
import { Card } from '../../components/ui/Card';
import { DataTag } from '../../components/ui/DataTag';
import { COOLING, COOLING_LIST } from '../../data/thermalConfig';
import { fmt } from '../../utils/format';
import { ThermalBench } from '../benches/ThermalBench';
import { PracticeShell } from '../components/PracticeShell';
import { PRACTICE_BY_ID } from '../practices';
import { usePracticeRecord } from '../storage';
import { useLocalThermal } from '../useLocalThermal';
import { ResultTile } from './Practice1';

const AMBIENT = 25;

export function Practice2() {
  const def = PRACTICE_BY_ID.p2;
  const { rec, update, reset } = usePracticeRecord('p2');
  const bench = useLocalThermal({ load: 1, ambientC: AMBIENT, cooling: 'pasiva', material: 'si', workload: 'intensiva', throttling: false, speed: 50 });
  const [flash, setFlash] = useState<string | null>(null);

  const record = () => {
    const c = COOLING[bench.params.cooling];
    const P = Math.round(bench.power * 10) / 10;
    const T = Math.round(bench.state.T * 10) / 10;
    const row = { sistema: c.label, P, T, R: Math.round(((T - AMBIENT) / P) * 1000) / 1000, aux: c.auxPowerW, estable: bench.stable ? 'sí' : 'no' };
    update((r) => ({ rows: [...r.rows.filter((x) => x.sistema !== c.label), row].sort((a, b) => COOLING_LIST.findIndex((k) => k.label === a.sistema) - COOLING_LIST.findIndex((k) => k.label === b.sistema)) }));
    setFlash(`Anotado: ${c.label} → ${fmt(T, 1)} °C`);
  };

  const data = rec.rows.map((r) => ({
    name: COOLING_LIST.find((c) => c.label === r.sistema)?.short ?? String(r.sistema),
    T: Number(r.T),
    R: Number(r.R),
    total: Number(r.P) + Number(r.aux),
  }));
  const coolest = [...data].sort((a, b) => a.T - b.T)[0];
  const hungriest = [...data].sort((a, b) => b.total - a.total)[0];

  const bars = (key: 'T' | 'total', unit: string, color: string) => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="name" stroke={CHART.axis} tick={{ fontSize: 13, fill: '#e2e8f0' }} />
          <YAxis stroke={CHART.axis} tick={{ fontSize: 12 }} width={56} tickFormatter={(v: number) => `${v}`} />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.08)' }} formatter={(v: number) => [`${fmt(v, 1)} ${unit}`, key === 'T' ? 'Temperatura' : 'Potencia total']} />
          <Bar dataKey={key} fill={color} radius={[4, 4, 0, 0]} maxBarSize={70} isAnimationActive={false}>
            <LabelList dataKey={key} position="top" fill="#e2e8f0" fontSize={12} formatter={(v: number) => fmt(v, key === 'T' ? 1 : 0)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const results = data.length > 0 && (
    <div className="grid gap-3 sm:grid-cols-3">
      {data.map((d) => (
        <ResultTile key={d.name} label={`R medida · ${d.name}`} value={`${fmt(d.R, 3)} K/W`} sub={`T = ${fmt(d.T, 1)} °C · total ${fmt(d.total, 0)} W`} />
      ))}
    </div>
  );

  const analysis = (
    <div className="space-y-6">
      {results}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Temperatura de equilibrio [°C]" subtitle="Chip al 100 %" actions={<DataTag kind="calculado" />}>
          {bars('T', '°C', CHART.chip)}
        </Card>
        <Card title="Potencia eléctrica total [W]" subtitle="Chip + sistema de refrigeración" actions={<DataTag kind="calculado" />}>
          {bars('total', 'W', CHART.ambient)}
        </Card>
      </div>
      <Card title="Interpretación" accent="violet">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            R = (T − T<sub>amb</sub>)/P: cuanto menor es R, más fácil sale el calor. El sistema con menor temperatura fue <strong className="text-white">{coolest?.name}</strong>.
          </li>
          <li>
            El de mayor consumo total fue <strong className="text-white">{hungriest?.name}</strong>: enfriar más no es gratis, porque bombas y ventiladores consumen energía.
          </li>
          <li>Sin refrigeración activa la temperatura supera con creces el límite de diseño (~100 °C): un chip real activaría su protección térmica o se dañaría a largo plazo.</li>
        </ul>
      </Card>
    </div>
  );

  const summary = (
    <div className="space-y-2 text-slate-300">
      {results}
      <p>
        El sistema más frío fue {coolest?.name} y el de mayor consumo total fue {hungriest?.name}. La resistencia térmica explica la diferencia de temperatura; la potencia auxiliar
        explica la diferencia de consumo.
      </p>
    </div>
  );

  return (
    <PracticeShell
      def={def}
      rec={rec}
      update={update}
      reset={reset}
      bench={<ThermalBench bench={bench} lockLoad onRecord={record} flash={flash} />}
      analysis={analysis}
      summary={summary}
    />
  );
}
