import { ClipboardList, Download, Factory, Leaf, Printer, Recycle, TriangleAlert, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, tooltipStyle } from '../components/charts/chartTheme';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { Card } from '../components/ui/Card';
import { ChemistryExplainer } from '../components/ui/ChemistryExplainer';
import { DataLegend, DataTag } from '../components/ui/DataTag';
import { Equation } from '../components/ui/Equation';
import { PageHeader } from '../components/ui/PageHeader';
import { RefCite } from '../components/ui/RefCite';
import { Slider } from '../components/ui/Slider';
import { useSimulation } from '../context/SimulationContext';
import { MATERIALS } from '../data/materials';
import { DEFAULT_TARIFF, DIGITAL_COSTS, EWASTE_FACTS, PHYSICAL_PROTOTYPE_COSTS, RECOVERY } from '../data/sustainability';
import { COOLING, POWER, THROTTLE, WORKLOADS } from '../data/thermalConfig';
import { AGING_EA_EV, AGING_REFERENCE_C, compareCooling } from '../science/energy';
import { chipPower } from '../science/thermal';
import { downloadText, toCsv } from '../utils/csv';
import { fmt, fmtClock } from '../utils/format';

function SimulationReport() {
  const { state, params, derived } = useSimulation();
  const h = state.history;
  const last = h[h.length - 1];
  const observations = useMemo(() => {
    const obs: string[] = [];
    if (h.length < 3) return ['Aún no hay suficientes datos: inicia la simulación unos segundos.'];
    const dT = state.T - state.Tinitial;
    obs.push(`La temperatura media ${dT >= 0 ? 'aumentó' : 'disminuyó'} ${fmt(Math.abs(dT), 1)} °C en ${fmtClock(state.t)} de tiempo simulado.`);
    const throttledSamples = h.filter((s) => s.P < chipPower(s.loadPct / 100, 0, false).nominal - 0.5).length;
    if (throttledSamples > 0) obs.push(`La protección térmica actuó durante ≈ ${throttledSamples} s simulados (T > ${THROTTLE.startC} °C).`);
    const coolings = new Set(h.map((s) => s.cooling));
    if (coolings.size > 1) obs.push(`Se probaron ${coolings.size} sistemas de refrigeración durante la misma corrida.`);
    const loads = new Set(h.map((s) => s.loadPct));
    if (loads.size > 1) obs.push(`La carga se modificó (${Math.min(...loads)} % a ${Math.max(...loads)} %): la temperatura respondió con retardo (τ ≈ ${fmt(derived.tau, 0)} s).`);
    const gap = Math.abs(state.T - derived.steadyT);
    obs.push(gap < 0.5 ? 'El sistema alcanzó prácticamente el equilibrio térmico.' : `Faltan ≈ ${fmt(gap, 1)} °C para alcanzar el equilibrio (${fmt(derived.steadyT, 1)} °C).`);
    return obs;
  }, [h, state.T, state.Tinitial, state.t, derived.tau, derived.steadyT]);

  const exportCsv = () => {
    const header = ['t_simulado_s', 'T_chip_C', 'T_punto_caliente_C', 'potencia_W', 'carga_pct', 'T_ambiente_C', 'refrigeracion', 'material'];
    const rows = h.map((s) => [s.t, +s.T.toFixed(3), +s.Thot.toFixed(3), +s.P.toFixed(2), s.loadPct, s.ambientC, COOLING[s.cooling].label, MATERIALS[s.material].formula]);
    const note = [['RESULTADOS SIMULADOS con el modelo de ThermoChip Lab (C·dT/dt = P − (T − Tamb)/R). No son mediciones de un procesador real.']];
    downloadText(`thermochip_resultados_simulados_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(header, [...note, ...rows]));
  };

  const m = MATERIALS[params.material];
  const rows: Array<[string, string]> = [
    ['Material semiconductor', `${m.name} (${m.formula})`],
    ['Modo / carga', `${WORKLOADS.find((w) => w.id === params.workload)?.label ?? 'Personalizado'} · ${Math.round(params.load * 100)} %`],
    ['Refrigeración', `${COOLING[params.cooling].label} (R = ${fmt(derived.R, 3)} K/W, C = ${fmt(derived.C, 0)} J/K)`],
    ['Temperatura ambiente', `${fmt(params.ambientC, 0)} °C`],
    ['Protección térmica', params.throttling ? `Activada (desde ${THROTTLE.startC} °C)` : 'Desactivada'],
    ['Tiempo simulado', `${fmtClock(state.t)} (${fmt(state.t, 0)} s)`],
    ['Temperatura inicial', `${fmt(state.Tinitial, 1)} °C`],
    ['Temperatura final (actual)', `${fmt(state.T, 1)} °C`],
    ['Temperatura máxima (punto caliente)', `${fmt(state.Tmax, 1)} °C`],
    ['Potencia actual', `${fmt(derived.power.effective, 1)} W (P_reposo ${POWER.idleW} W, P_máx ${POWER.maxW} W)`],
    ['Equilibrio y constante de tiempo', `T∞ = ${fmt(derived.steadyT, 1)} °C · τ = ${fmt(derived.tau, 0)} s`],
  ];

  return (
    <Card
      id="informe"
      title="Panel de resultados científicos"
      subtitle="Corrida actual del simulador térmico"
      icon={ClipboardList}
      className="print-area"
      actions={
        <div className="no-print flex gap-2">
          <button type="button" className="btn-ghost" onClick={exportCsv} disabled={h.length < 2}>
            <Download size={16} aria-hidden /> CSV
          </button>
          <button type="button" className="btn-primary" onClick={() => window.print()}>
            <Printer size={16} aria-hidden /> Imprimir resumen
          </button>
        </div>
      }
    >
      <div className="print-only mb-4">
        <h1 className="text-2xl font-bold">ThermoChip Lab — Resumen de simulación</h1>
        <p className="text-sm">Química General I · UNIBE · Generado el {new Date().toLocaleString('es-ES')}</p>
      </div>
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
        <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
        Todos los valores son <strong className="mx-1">resultados simulados</strong> de un modelo simplificado con parámetros supuestos; no son mediciones de un procesador real.
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-white/5">
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-400">
                  {k}
                </th>
                <td className="num py-2 text-slate-100">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <TemperatureChart history={h} height={260} />
          <p className="mt-1 text-xs text-slate-400">
            {h.length} muestras (1 por segundo simulado){last ? ` · última: t = ${fmt(last.t, 0)} s` : ''}.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-base font-semibold">Observaciones</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            {observations.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-base font-semibold">Limitaciones del modelo</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Modelo térmico de un solo nodo (capacitancia concentrada).</li>
            <li>Potencia lineal con la carga; las fugas no dependen de T en el modelo.</li>
            <li>Parámetros R, C y potencias supuestos para un diseño hipotético.</li>
            <li>El mapa de calor por núcleos es una representación conceptual.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function EnergyCalculator() {
  const { params } = useSimulation();
  const [load, setLoad] = useState(Math.round(params.load * 100));
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(30);
  const [tariff, setTariff] = useState(DEFAULT_TARIFF);
  const results = useMemo(
    () => compareCooling({ load: load / 100, ambientC: params.ambientC, material: params.material, throttling: params.throttling, hours: hours * days, tariff }),
    [load, params.ambientC, params.material, params.throttling, hours, days, tariff],
  );
  const chartData = results.map((r) => ({ name: r.cooling.short, chip: +((r.chipW * hours * days) / 1000).toFixed(2), cooling: +((r.auxW * hours * days) / 1000).toFixed(2) }));
  const fan = results[1];
  const adv = results[2];
  const pas = results[0];

  return (
    <Card title="Eficiencia energética de la refrigeración" subtitle="Escenarios hipotéticos en equilibrio térmico" icon={Zap} accent="amber">
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-3">
          <Slider label="Carga" value={load} min={0} max={100} onChange={setLoad} display={`${load} %`} color="#f97316" />
          <Slider label="Horas de uso por día" value={hours} min={1} max={24} onChange={setHours} display={`${hours} h`} />
          <Slider label="Días" value={days} min={1} max={365} onChange={setDays} display={`${days}`} />
          <label className="block text-sm font-medium text-slate-300">
            Tarifa eléctrica (por kWh)
            <input
              type="number"
              min={0}
              step={0.5}
              value={tariff}
              onChange={(e) => setTariff(Math.max(0, Number(e.target.value) || 0))}
              className="num mt-1 w-full rounded-lg border border-white/10 bg-lab-800 px-3 py-2 text-white"
            />
            <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <DataTag kind="supuesto" compact /> Valor editable; consulte su factura (RD$/kWh u otra moneda).
            </span>
          </label>
        </div>
        <div className="space-y-4 xl:col-span-9">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-2">Escenario</th>
                  <th className="py-2 pr-2">T equilibrio</th>
                  <th className="py-2 pr-2">Chip</th>
                  <th className="py-2 pr-2">Refrigeración</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Rendimiento</th>
                  <th className="py-2 pr-2">Energía</th>
                  <th className="py-2 pr-2">Costo</th>
                  <th className="py-2">Envejecimiento</th>
                </tr>
              </thead>
              <tbody className="num divide-y divide-white/5 [&_td+td]:whitespace-nowrap">
                {results.map((r) => (
                  <tr key={r.cooling.id}>
                    <td className="py-2 pr-2 font-sans font-semibold text-white">{r.cooling.label}</td>
                    <td className="py-2 pr-2">{fmt(r.steadyT, 1)} °C</td>
                    <td className="py-2 pr-2">{fmt(r.chipW, 1)} W</td>
                    <td className="py-2 pr-2">{fmt(r.auxW, 0)} W</td>
                    <td className="py-2 pr-2 font-semibold text-white">{fmt(r.totalW, 1)} W</td>
                    <td className="py-2 pr-2">{fmt(r.performance * 100, 0)} %</td>
                    <td className="py-2 pr-2">{fmt(r.energyKWh, 2)} kWh</td>
                    <td className="py-2 pr-2">{fmt(r.cost, 2)}</td>
                    <td className="py-2">×{fmt(r.agingFactor, r.agingFactor < 10 ? 1 : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <DataTag kind="calculado" /> Envejecimiento: factor de Arrhenius respecto a {AGING_REFERENCE_C} °C con Ea = {AGING_EA_EV} eV <DataTag kind="supuesto" compact />.
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART.axis} tick={{ fontSize: 12, fill: '#e2e8f0' }} />
                  <YAxis stroke={CHART.axis} tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${fmt(v, 0)} kWh`} width={70} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.08)' }} formatter={(v: number, n: string) => [`${fmt(v, 2)} kWh`, n]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="chip" name="Chip" stackId="e" fill={CHART.chip} stroke="#070d1f" strokeWidth={2} isAnimationActive={false} />
                  <Bar dataKey="cooling" name="Refrigeración" stackId="e" fill={CHART.ambient} stroke="#070d1f" strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <strong className="text-white">No siempre ahorra energía:</strong> la refrigeración avanzada consume {fmt(adv.auxW - fan.auxW, 0)} W más que el ventilador y baja la temperatura
                {' '}{fmt(fan.steadyT - adv.steadyT, 1)} °C. En este modelo la potencia del chip no depende de T, así que el consumo total sube.
              </p>
              {pas.performance < 0.999 ? (
                <p>
                  Sin refrigeración activa el chip consume menos ({fmt(pas.chipW, 0)} W) sólo porque la protección térmica lo frena: entrega el {fmt(pas.performance * 100, 0)} % del
                  rendimiento. Menos energía no significa más eficiencia si el trabajo útil también baja.
                </p>
              ) : (
                <p>A esta carga incluso la refrigeración pasiva mantiene el chip bajo el límite.</p>
              )}
              <p>
                En chips reales, enfriar reduce también las corrientes de fuga, lo que puede compensar parte del consumo de la refrigeración; además, menor temperatura ralentiza la
                degradación (factor de envejecimiento) <RefCite ids={['jedec', 'pop']} />.
              </p>
            </div>
          </div>
          <Equation
            name="Energía y aceleración del envejecimiento"
            refs={['jedec']}
            vars={[
              { sym: 'E', desc: 'Energía consumida', unit: 'kWh' },
              { sym: 'P_total', desc: 'Potencia del chip + refrigeración', unit: 'W' },
              { sym: 'Ea', desc: 'Energía de activación del mecanismo de fallo', unit: 'eV' },
              { sym: 'AF', desc: 'Cuántas veces más rápido envejece que a T_ref' },
            ]}
            validity="Arrhenius describe mecanismos activados térmicamente; Ea varía entre ~0,3 y 1,2 eV según el mecanismo."
          >
            E = P<sub>total</sub>·t/1000 · AF = e<sup>(Ea/k)(1/T_ref − 1/T)</sup>
          </Equation>
        </div>
      </div>
    </Card>
  );
}

export function ResultsPage() {
  const physMin = PHYSICAL_PROTOTYPE_COSTS.reduce((a, c) => a + c.min, 0);
  const physMax = PHYSICAL_PROTOTYPE_COSTS.reduce((a, c) => a + c.max, 0);
  const digMax = DIGITAL_COSTS.reduce((a, c) => a + c.max, 0);
  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          eyebrow="Módulo 6 · Resultados y sostenibilidad"
          icon={Leaf}
          title="Resultados, energía y sostenibilidad"
          description="Consulta y exporta los resultados de la simulación, compara estrategias de refrigeración y analiza el impacto económico y ambiental."
          actions={<DataLegend />}
        />
      </div>

      <SimulationReport />

      <div className="no-print space-y-6">
        <EnergyCalculator />

        <Card title="Costo del prototipo: físico hipotético vs. simulación digital" subtitle="Estimaciones orientativas en USD (no son cotizaciones)" icon={Factory} actions={<DataTag kind="supuesto" />}>
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: 'Prototipo físico hipotético', items: PHYSICAL_PROTOTYPE_COSTS, total: `${physMin}–${physMax} USD` },
              { title: 'Simulación digital (ThermoChip Lab)', items: DIGITAL_COSTS, total: `0–${fmt(digMax, 0)} USD` },
            ].map((block) => (
              <div key={block.title}>
                <h3 className="mb-2 font-semibold">{block.title}</h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-white/5">
                    {block.items.map((c) => (
                      <tr key={c.item}>
                        <td className="py-2 pr-3 text-slate-300">{c.item}</td>
                        <td className="num whitespace-nowrap py-2 text-right text-white">{c.max === 0 ? '0' : `${fmt(c.min, c.min < 1 ? 1 : 0)}–${fmt(c.max, 0)}`}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-white">Total estimado</td>
                      <td className="num whitespace-nowrap py-2 text-right font-semibold text-cyan-200">{block.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            La simulación no genera residuos electrónicos, permite repetir experimentos sin riesgo y explorar materiales (Ge, GaAs) costosos o tóxicos. Su limitación: los resultados dependen
            de la validez del modelo y deben contrastarse con mediciones reales.
          </p>
        </Card>

        <Card title="Residuos electrónicos y recuperación de materiales" icon={Recycle} accent="none" actions={<RefCite ids={['gem2024']} />}>
          <div className="grid gap-4 sm:grid-cols-3">
            {EWASTE_FACTS.map((f) => (
              <div key={f.label} className="rounded-xl border border-white/[0.07] bg-lab-950/50 p-4">
                <div className="num text-3xl font-bold text-white">{f.value}</div>
                <div className="mt-1 text-sm text-slate-300">{f.label}</div>
                <div className="mt-2">
                  <DataTag kind={f.kind} compact />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {RECOVERY.map((r) => (
              <div key={r.material} className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3 text-sm">
                <div className="font-semibold text-emerald-200">{r.material}</div>
                <div className="text-xs text-slate-400">{r.source}</div>
                <p className="mt-1 text-slate-300">{r.note}</p>
              </div>
            ))}
          </div>
        </Card>

        <ChemistryExplainer
          title="¿Qué está ocurriendo químicamente? — Energía y materiales"
          layers={[
            { level: 'material', key: 'mat', text: 'Los metales de los circuitos (Cu, Au) y los semiconductores (Si, Ga, Ge, As) pueden recuperarse mediante reacciones de disolución selectiva (hidrometalurgia) o fundición; los compuestos tóxicos como As y Pb deben estabilizarse químicamente.' },
            { level: 'dispositivo', key: 'dev', text: 'A mayor temperatura se aceleran procesos químicos y físicos de degradación (difusión de átomos, electromigración, oxidación): por eso la gestión térmica prolonga la vida útil.' },
            { level: 'chip', key: 'chip', text: 'Toda la energía eléctrica que consume el chip termina como calor. Refrigerar cuesta energía adicional; diseñar chips más eficientes reduce ambos consumos.' },
          ]}
        />
      </div>
    </div>
  );
}
