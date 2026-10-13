import { BarChart3, Check, Info, Sparkles, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, tooltipStyle } from '../components/charts/chartTheme';
import { MaterialCurves } from '../components/charts/MaterialCurves';
import { Card } from '../components/ui/Card';
import { DataTag } from '../components/ui/DataTag';
import { PageHeader } from '../components/ui/PageHeader';
import { RefCite } from '../components/ui/RefCite';
import { MATERIAL_LIST, MATERIALS, PEROVSKITE } from '../data/materials';
import type { MaterialId } from '../types';
import { fmt, fmtSci } from '../utils/format';

type CompId = MaterialId | 'perov';

interface Entry {
  id: CompId;
  formula: string;
  name: string;
  color: string;
  eg: number;
  egNote?: string;
  k: number;
  muN: number | null;
  muP: number | null;
  ni: number | null;
  structure: string;
  bonding: string;
  composition: string;
  gapType: string;
  applications: string[];
  advantages: string[];
  limitations: string[];
  refs: string[];
}

const ENTRIES: Entry[] = [
  ...MATERIAL_LIST.map<Entry>((m) => ({
    id: m.id,
    formula: m.formula,
    name: m.name,
    color: m.color,
    eg: m.eg300.value,
    k: m.thermalConductivity.value,
    muN: m.muN300.value,
    muP: m.muP300.value,
    ni: m.ni300.value,
    structure: m.structure,
    bonding: m.bonding,
    composition: m.composition,
    gapType: m.gapType,
    applications: m.applications,
    advantages: m.advantages,
    limitations: m.limitations,
    refs: ['ioffe', 'sze'],
  })),
  {
    id: 'perov',
    formula: 'MAPbI₃',
    name: 'Perovskita de haluro',
    color: PEROVSKITE.color,
    eg: (PEROVSKITE.eg.min + PEROVSKITE.eg.max) / 2,
    egNote: `${fmt(PEROVSKITE.eg.min, 2)}–${fmt(PEROVSKITE.eg.max, 2)} eV`,
    k: PEROVSKITE.thermalConductivity.value,
    muN: null,
    muP: null,
    ni: null,
    structure: 'Perovskita ABX₃',
    bonding: PEROVSKITE.bonding,
    composition: 'CH₃NH₃⁺ (A), Pb²⁺ (B), I⁻ (X)',
    gapType: 'directa',
    applications: ['Celdas solares de capa delgada', 'Tándem perovskita/silicio', 'LED y fotodetectores (investigación)'],
    advantages: PEROVSKITE.advantages,
    limitations: PEROVSKITE.limitations,
    refs: PEROVSKITE.refs,
  },
];

function PropertyBars({ data, dataKey, unit, format, log = false }: { data: Entry[]; dataKey: 'eg' | 'k' | 'muN' | 'ni'; unit: string; format: (v: number) => string; log?: boolean }) {
  const rows = data.filter((d) => d[dataKey] !== null);
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 24, right: 12, bottom: 4, left: 4 }} barCategoryGap="28%">
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="formula" stroke={CHART.axis} tick={{ fontSize: 13, fill: '#e2e8f0' }} />
          <YAxis
            stroke={CHART.axis}
            tick={{ fontSize: 12 }}
            width={66}
            scale={log ? 'log' : 'auto'}
            domain={log ? [1e5, 1e14] : [0, 'auto']}
            ticks={log ? [1e5, 1e8, 1e11, 1e14] : undefined}
            tickFormatter={(v: number) => (log ? fmtSci(v, 0) : fmt(v, v < 10 ? 1 : 0))}
            allowDataOverflow={log}
          />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.08)' }} formatter={(v: number) => [`${format(v)} ${unit}`, 'Valor']} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={64}>
            {rows.map((d) => (
              <Cell key={d.id} fill={d.color} />
            ))}
            <LabelList dataKey={dataKey} position="top" fill="#e2e8f0" fontSize={12} formatter={(v: number) => format(v)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparatorPage() {
  const [selected, setSelected] = useState<CompId[]>(['si', 'ge', 'gaas']);
  const data = useMemo(() => ENTRIES.filter((e) => selected.includes(e.id)), [selected]);
  const lineIds = useMemo(() => selected.filter((s): s is MaterialId => s !== 'perov'), [selected]);

  const toggle = (id: CompId) =>
    setSelected((cur) => {
      if (cur.includes(id)) return cur.length > 2 ? cur.filter((x) => x !== id) : cur;
      return ENTRIES.map((e) => e.id).filter((x) => cur.includes(x) || x === id);
    });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo 4 · Comparador"
        icon={BarChart3}
        title="Comparador de semiconductores"
        description="Selecciona dos o más materiales para comparar sus propiedades publicadas. Estas propiedades describen el material, no el rendimiento de un procesador."
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Materiales a comparar">
        {ENTRIES.map((e) => {
          const on = selected.includes(e.id);
          return (
            <button
              key={e.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(e.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${on ? 'border-white/25 bg-white/[0.08] text-white' : 'border-white/[0.07] text-slate-400 hover:text-slate-200'}`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-md" style={{ background: on ? e.color : 'transparent', border: `2px solid ${e.color}` }}>
                {on && <Check size={13} className="text-white" aria-hidden />}
              </span>
              {e.formula} <span className="hidden font-normal text-slate-400 sm:inline">· {e.name}</span>
            </button>
          );
        })}
        <span className="text-xs text-slate-500">Mínimo 2 materiales</span>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-400/[0.06] p-4 text-sm text-sky-100/90">
        <Info size={18} className="mt-0.5 shrink-0 text-sky-300" aria-hidden />
        <p>
          <strong>Datos de materiales ≠ predicciones del simulador.</strong> Las barras muestran propiedades medidas a 300 K <DataTag kind="publicado" compact />. Un procesador más
          rápido o más frío no se deduce sólo de ellas: también influyen el diseño del transistor, la fabricación, la tensión, el encapsulado y la refrigeración. Los resultados del chip
          virtual están en el simulador <DataTag kind="calculado" compact />.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Banda prohibida a 300 K" subtitle="Energía mínima para liberar un electrón" actions={<RefCite ids={['ioffe', 'green']} />}>
          <PropertyBars data={data} dataKey="eg" unit="eV" format={(v) => fmt(v, 2)} />
          {selected.includes('perov') && <p className="text-xs text-slate-400">MAPbI₃: valor central del intervalo {ENTRIES[3].egNote}.</p>}
        </Card>
        <Card title="Conductividad térmica" subtitle="Facilidad para conducir calor a través del material" actions={<RefCite ids={['glassbrenner', 'ioffe', 'pisoni']} />}>
          <PropertyBars data={data} dataKey="k" unit="W/(m·K)" format={(v) => fmt(v, v < 10 ? 1 : 0)} />
        </Card>
        <Card title="Movilidad de electrones" subtitle="Rapidez con que se mueven los electrones en un campo eléctrico" actions={<RefCite ids={['ioffe', 'sze']} />}>
          <PropertyBars data={data} dataKey="muN" unit="cm²/(V·s)" format={(v) => fmt(v, 0)} />
          {selected.includes('perov') && <p className="text-xs text-slate-400">MAPbI₃ excluida: valores de 1 a ~100 cm²/(V·s) según la síntesis; no son comparables directamente.</p>}
        </Card>
        <Card title="Portadores intrínsecos nᵢ a 300 K" subtitle="Escala logarítmica" actions={<RefCite ids={['ioffe', 'sze']} />}>
          <PropertyBars data={data} dataKey="ni" unit="cm⁻³" format={(v) => fmtSci(v, 1)} log />
        </Card>
      </div>

      {lineIds.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Eg(T): ecuación de Varshni" icon={Sparkles} actions={<DataTag kind="calculado" />}>
            <MaterialCurves kind="eg" ids={lineIds} height={260} />
          </Card>
          <Card title="nᵢ(T): portadores térmicos" icon={Sparkles} actions={<DataTag kind="calculado" />}>
            <MaterialCurves kind="ni" ids={lineIds} height={260} />
          </Card>
        </div>
      )}

      <Card title="Tabla comparativa" icon={Table2} bodyClassName="p-0 sm:p-0">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="sticky left-0 bg-lab-900 p-3 text-xs uppercase tracking-wider text-slate-400">Propiedad</th>
                {data.map((e) => (
                  <th key={e.id} className="p-3">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="h-3 w-3 rounded-full" style={{ background: e.color }} aria-hidden />
                      {e.formula}
                    </span>
                    <span className="text-xs font-normal text-slate-400">{e.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 align-top">
              {(
                [
                  ['Composición', (e: Entry) => e.composition],
                  ['Estructura cristalina', (e: Entry) => e.structure],
                  ['Enlace', (e: Entry) => e.bonding],
                  ['Banda prohibida (300 K)', (e: Entry) => e.egNote ?? `${fmt(e.eg, 2)} eV`],
                  ['Tipo de banda', (e: Entry) => e.gapType],
                  ['Conductividad térmica', (e: Entry) => `${fmt(e.k, e.k < 10 ? 1 : 0)} W/(m·K)`],
                  ['Movilidad e⁻ / h⁺', (e: Entry) => (e.muN ? `${fmt(e.muN, 0)} / ${fmt(e.muP ?? 0, 0)} cm²/(V·s)` : '1–100 cm²/(V·s) (variable)')],
                  ['nᵢ (300 K)', (e: Entry) => (e.ni ? `${fmtSci(e.ni)} cm⁻³` : '—')],
                  ['Aplicaciones', (e: Entry) => e.applications.join(' · ')],
                  ['Ventajas', (e: Entry) => e.advantages.join(' · ')],
                  ['Limitaciones', (e: Entry) => e.limitations.join(' · ')],
                ] as Array<[string, (e: Entry) => string]>
              ).map(([label, get]) => (
                <tr key={label}>
                  <th scope="row" className="sticky left-0 bg-lab-900 p-3 text-left text-xs font-semibold text-slate-400">
                    {label}
                  </th>
                  {data.map((e) => (
                    <td key={e.id} className="p-3 text-slate-200">
                      {get(e)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-white/5 p-3 text-xs text-slate-400">
          Todos los valores son datos publicados para material de alta pureza a 300 K <RefCite ids={['ioffe', 'sze', 'glassbrenner', 'green', 'pisoni']} />. Pueden variar entre fuentes.
          {' '}La perovskita se incluye con fines educativos y no forma parte del simulador térmico ({Object.keys(MATERIALS).length} materiales).
        </p>
      </Card>
    </div>
  );
}
