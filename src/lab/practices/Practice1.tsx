import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DataTag } from '../../components/ui/DataTag';
import { Equation } from '../../components/ui/Equation';
import { totalResistance } from '../../science/thermal';
import { linearFit, percentError } from '../../science/stats';
import { fmt } from '../../utils/format';
import { ThermalBench } from '../benches/ThermalBench';
import { PracticeShell } from '../components/PracticeShell';
import { ScatterFit } from '../components/ScatterFit';
import { PRACTICE_BY_ID } from '../practices';
import { usePracticeRecord } from '../storage';
import { useLocalThermal } from '../useLocalThermal';

const AMBIENT = 25;

export function Practice1() {
  const def = PRACTICE_BY_ID.p1;
  const { rec, update, reset } = usePracticeRecord('p1');
  const bench = useLocalThermal({ load: 0, ambientC: AMBIENT, cooling: 'ventilador', material: 'si', workload: 'personalizado', throttling: false, speed: 50 });
  const [flash, setFlash] = useState<string | null>(null);

  const record = () => {
    const row = {
      carga: Math.round(bench.params.load * 100),
      P: Math.round(bench.power * 10) / 10,
      T: Math.round(bench.state.T * 10) / 10,
      estable: bench.stable ? 'sí' : 'no',
    };
    update((r) => ({ rows: [...r.rows, row] }));
    setFlash(`Anotado: ${row.carga} % → ${fmt(row.P, 1)} W, ${fmt(row.T, 1)} °C${bench.stable ? '' : ' (lectura no estable)'}`);
  };

  const pts = rec.rows.map((r) => ({ x: Number(r.P), y: Number(r.T) }));
  const fit = linearFit(pts.map((p) => p.x), pts.map((p) => p.y));
  const rModel = totalResistance('ventilador', 'si');
  const unstable = rec.rows.filter((r) => r.estable === 'no').length;

  const results = fit && (
    <div className="grid gap-3 sm:grid-cols-3">
      <ResultTile label="Resistencia térmica medida (pendiente)" value={`${fmt(fit.slope, 3)} K/W`} />
      <ResultTile label="T con P = 0 (intercepto)" value={`${fmt(fit.intercept, 1)} °C`} sub={`Ambiente real: ${AMBIENT} °C`} />
      <ResultTile label="Calidad del ajuste R²" value={fmt(fit.r2, 4)} sub={fit.r2 > 0.99 ? 'Excelente relación lineal' : 'Revisa mediciones no estables'} />
    </div>
  );

  const analysis = (
    <div className="space-y-6">
      <Card title="Temperatura de equilibrio frente a potencia" subtitle="Tus mediciones y la recta de mejor ajuste" actions={<DataTag kind="calculado" />}>
        <ScatterFit points={pts} fit={fit} xLabel="Potencia P [W]" yLabel="Temperatura T [°C]" xDigits={0} yDigits={0} />
      </Card>
      {results}
      <div className="grid gap-4 lg:grid-cols-2">
        <Equation
          name="Modelo de equilibrio"
          vars={[
            { sym: 'T', desc: 'Temperatura de equilibrio (eje y)', unit: '°C' },
            { sym: 'P', desc: 'Potencia disipada (eje x)', unit: 'W' },
            { sym: 'R', desc: 'Pendiente = resistencia térmica', unit: 'K/W' },
          ]}
          refs={['incropera']}
        >
          T = T<sub>amb</sub> + R · P
        </Equation>
        <Card title="Comparación con el valor del modelo" accent="violet">
          {fit ? (
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                Tu pendiente: <strong className="num text-white">{fmt(fit.slope, 3)} K/W</strong>. Resistencia del banco (ventilador + dado de Si):{' '}
                <strong className="num text-white">{fmt(rModel, 3)} K/W</strong> <DataTag kind="supuesto" compact />.
              </p>
              <p>
                Diferencia: <strong className="num text-white">{fmt(percentError(fit.slope, rModel), 1)} %</strong>.{' '}
                {percentError(fit.slope, rModel) < 2 ? 'Excelente: tus lecturas estaban en equilibrio.' : 'Una diferencia mayor suele indicar lecturas tomadas antes del equilibrio.'}
              </p>
              {unstable > 0 && <p className="text-amber-200">Tienes {unstable} lectura(s) no estables: elimínalas en el experimento y repítelas para mejorar el resultado.</p>}
              <p>
                Interpretación: por cada vatio adicional el chip se calienta ≈ {fmt(fit.slope, 2)} °C. Con 100 W de más, ≈ {fmt(fit.slope * 100, 0)} °C sobre el ambiente.
              </p>
            </div>
          ) : (
            <p className="text-slate-400">Necesitas potencias distintas para ajustar una recta.</p>
          )}
        </Card>
      </div>
    </div>
  );

  const summary = fit ? (
    <div className="space-y-2 text-slate-300">
      {results}
      <p>
        La temperatura de equilibrio aumenta linealmente con la potencia (R² = {fmt(fit.r2, 4)}). La pendiente da una resistencia térmica de {fmt(fit.slope, 3)} K/W (modelo:{' '}
        {fmt(rModel, 3)} K/W; diferencia {fmt(percentError(fit.slope, rModel), 1)} %).
      </p>
    </div>
  ) : null;

  return (
    <PracticeShell
      def={def}
      rec={rec}
      update={update}
      reset={reset}
      bench={<ThermalBench bench={bench} lockCooling onRecord={record} flash={flash} />}
      analysis={analysis}
      summary={summary}
    />
  );
}

export function ResultTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200/80">{label}</div>
      <div className="num mt-1 text-3xl font-bold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
