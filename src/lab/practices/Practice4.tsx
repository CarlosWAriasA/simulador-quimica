import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Gauge, NotebookPen, XCircle, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, tooltipStyle } from '../../components/charts/chartTheme';
import { Card } from '../../components/ui/Card';
import { DataTag } from '../../components/ui/DataTag';
import { Slider } from '../../components/ui/Slider';
import { siliconCarriers } from '../../science/doping';
import { fmt, fmtSci } from '../../utils/format';
import { Instrument } from '../components/Instrument';
import { PracticeShell } from '../components/PracticeShell';
import { PRACTICE_BY_ID } from '../practices';
import { usePracticeRecord } from '../storage';
import { ROOM_T_K, UNKNOWN_SAMPLES, hotProbeSign, sampleResistivity } from '../models';

const ELECTRON = '#3987e5';
const HOLE = '#d95926';

function Wafer({ id, active }: { id: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`w-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="0.5" stopColor="#64748b" />
          <stop offset="1" stopColor="#1e293b" />
        </radialGradient>
      </defs>
      <path d="M50 4 A46 46 0 1 1 49.9 4 Z M 30 90 L 70 90" fill={`url(#w-${id})`} stroke={active ? '#22d3ee' : '#475569'} strokeWidth={active ? 3 : 1.5} />
      <text x="50" y="57" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">
        {id}
      </text>
    </svg>
  );
}

function Voltmeter({ sign }: { sign: 1 | -1 | 0 }) {
  return (
    <svg viewBox="0 0 200 120" className="h-auto w-full" role="img" aria-label={sign === 0 ? 'Voltímetro en cero' : `Voltímetro con desviación ${sign > 0 ? 'positiva' : 'negativa'}`}>
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#334155" strokeWidth="14" />
      <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke={HOLE} strokeOpacity="0.5" strokeWidth="14" />
      <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke={ELECTRON} strokeOpacity="0.5" strokeWidth="14" />
      <text x="24" y="116" fill="#f0946b" fontSize="18" fontWeight="700">
        −
      </text>
      <text x="166" y="116" fill="#7fb2f0" fontSize="18" fontWeight="700">
        +
      </text>
      <text x="100" y="116" textAnchor="middle" fill="#94a3b8" fontSize="12">
        0
      </text>
      <motion.line x1="100" y1="100" x2="100" y2="30" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" animate={{ rotate: sign * 55 }} transition={{ type: 'spring', stiffness: 80, damping: 9 }} style={{ originX: '100px', originY: '100px' }} />
      <circle cx="100" cy="100" r="6" fill="#f8fafc" />
    </svg>
  );
}

export function Practice4() {
  const def = PRACTICE_BY_ID.p4;
  const { rec, update, reset } = usePracticeRecord('p4');
  const [sampleId, setSampleId] = useState('X1');
  const [probe, setProbe] = useState<Record<string, 1 | -1>>({});
  const [rho, setRho] = useState<Record<string, number>>({});
  const [measuring, setMeasuring] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const applyProbe = () => setProbe((p) => ({ ...p, [sampleId]: hotProbeSign(sampleId) }));
  const measureRho = () => {
    setMeasuring(true);
    window.setTimeout(() => {
      setRho((r) => ({ ...r, [sampleId]: sampleResistivity(sampleId) }));
      setMeasuring(false);
    }, 700);
  };
  const canRecord = probe[sampleId] !== undefined && rho[sampleId] !== undefined;
  const record = () => {
    if (!canRecord) return;
    const row = { muestra: sampleId, signo: probe[sampleId] > 0 ? '+ (positivo)' : '− (negativo)', rho: rho[sampleId] };
    update((r) => ({ rows: [...r.rows.filter((x) => x.muestra !== sampleId), row].sort((a, b) => String(a.muestra).localeCompare(String(b.muestra))) }));
    setFlash(`Anotado: ${sampleId}`);
  };

  const bench = (
    <section className="panel-strong p-4 sm:p-6" aria-label="Banco de trabajo">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="text-sm font-medium text-slate-300">Elige una oblea de silicio desconocida</div>
          <div className="grid grid-cols-3 gap-3">
            {UNKNOWN_SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === sampleId}
                onClick={() => setSampleId(s.id)}
                className={`rounded-2xl border p-2 transition-colors ${s.id === sampleId ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <div className="mx-auto aspect-square w-full max-w-[110px]">
                  <Wafer id={s.id} active={s.id === sampleId} />
                </div>
                <div className="mt-1 text-xs text-slate-400">{rec.rows.some((r) => r.muestra === s.id) ? 'Medida ✓' : 'Sin medir'}</div>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn-ghost justify-start py-3 text-base" onClick={applyProbe}>
              <Flame size={18} className="text-orange-300" aria-hidden /> Aplicar punta caliente
            </button>
            <button type="button" className="btn-ghost justify-start py-3 text-base" onClick={measureRho} disabled={measuring}>
              <Zap size={18} className="text-cyan-300" aria-hidden /> {measuring ? 'Midiendo…' : 'Sonda de 4 puntas'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Punta caliente: el voltímetro se conecta con (+) a la punta caliente. Los portadores mayoritarios se difunden de la zona caliente a la fría. <DataTag kind="conceptual" compact />
          </p>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Voltímetro (punta caliente)</div>
            <Voltmeter sign={probe[sampleId] ?? 0} />
          </div>
          <Instrument
            label="Resistividad · 4 puntas"
            icon={Gauge}
            value={measuring ? '- - -' : rho[sampleId] !== undefined ? fmtSci(rho[sampleId], 2) : '—'}
            unit="Ω·cm"
            hint="Medición a 300 K (3 cifras significativas)"
          />
          <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={record} disabled={!canRecord} className="btn w-full bg-emerald-400 text-base text-lab-950 hover:bg-emerald-300">
            <NotebookPen size={18} aria-hidden /> Registrar {sampleId}
          </motion.button>
          {!canRecord && <p className="text-xs text-amber-200/90">Usa los dos instrumentos sobre {sampleId} antes de registrar.</p>}
          {flash && <p className="text-sm font-medium text-emerald-300" role="status">{flash}</p>}
        </div>
      </div>
    </section>
  );

  // ---- Análisis: curva ρ–N y respuesta del estudiante ----
  const curve = useMemo(() => {
    const out: Array<{ N: number; rhoN: number; rhoP: number }> = [];
    for (let e = 13; e <= 18.001; e += 0.1) {
      const N = 10 ** e;
      out.push({ N, rhoN: siliconCarriers('fosforo', N, ROOM_T_K).rho, rhoP: siliconCarriers('boro', N, ROOM_T_K).rho });
    }
    return out;
  }, []);
  const measured = rec.rows.map((r) => String(r.muestra));
  const [sel, setSel] = useState<string>(measured[0] ?? 'X1');
  const active = measured.includes(sel) ? sel : measured[0];
  const row = rec.rows.find((r) => r.muestra === active);
  const guessType = String(rec.extra[`${active}_tipo`] ?? '');
  const guessLog = Number(rec.extra[`${active}_logN`] ?? 15);
  const checked = rec.extra[`${active}_ok`];
  const truth = UNKNOWN_SAMPLES.find((s) => s.id === active);

  const check = () => {
    if (!truth) return;
    const typeOk = (guessType === 'N') === (truth.dopant === 'fosforo');
    const nOk = Math.abs(guessLog - Math.log10(truth.N)) <= 0.3;
    update((r) => ({ extra: { ...r.extra, [`${active}_ok`]: typeOk && nOk ? 'sí' : typeOk ? 'tipo' : 'no' } }));
  };

  const analysis = (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Muestra a analizar">
        {measured.map((id) => (
          <button key={id} type="button" aria-pressed={id === active} onClick={() => setSel(id)} className={`rounded-xl border px-4 py-2 font-semibold ${id === active ? 'border-cyan-400/70 bg-cyan-400/10 text-white' : 'border-white/10 text-slate-400'}`}>
            {id}
          </button>
        ))}
      </div>
      {row && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card title="Curva resistividad–dopaje del silicio (300 K)" subtitle="Busca dónde corta tu resistividad medida (línea blanca)" actions={<DataTag kind="calculado" />}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curve} margin={{ top: 16, right: 16, bottom: 20, left: 6 }}>
                  <CartesianGrid stroke={CHART.grid} />
                  <XAxis
                    dataKey="N"
                    type="number"
                    scale="log"
                    domain={[1e13, 1e18]}
                    ticks={[1e13, 1e14, 1e15, 1e16, 1e17, 1e18]}
                    tickFormatter={(v: number) => fmtSci(v, 0)}
                    stroke={CHART.axis}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Concentración de dopante N [cm⁻³]', position: 'insideBottom', offset: -12, fill: '#cbd5e1', fontSize: 12 }}
                  />
                  <YAxis scale="log" domain={[0.01, 1000]} ticks={[0.01, 0.1, 1, 10, 100, 1000]} tickFormatter={(v: number) => fmt(v, v < 1 ? 2 : 0)} stroke={CHART.axis} tick={{ fontSize: 12 }} width={56} allowDataOverflow />
                  <Tooltip {...tooltipStyle} labelFormatter={(v: number) => `N = ${fmtSci(v, 1)} cm⁻³`} formatter={(v: number, n: string) => [`${fmtSci(v, 2)} Ω·cm`, n]} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
                  <ReferenceLine y={Number(row.rho)} stroke="#f8fafc" strokeDasharray="6 4" label={{ value: `ρ medida ${active}`, fill: '#f8fafc', fontSize: 11, position: 'insideTopRight' }} />
                  <ReferenceLine x={10 ** guessLog} stroke="#fbbf24" strokeWidth={2} label={{ value: 'tu estimación', fill: '#fbbf24', fontSize: 11, position: 'insideTopLeft' }} />
                  <Line dataKey="rhoN" name="Tipo N (fósforo)" stroke={ELECTRON} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line dataKey="rhoP" name="Tipo P (boro)" stroke={HOLE} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title={`Tu identificación de ${active}`} accent="violet">
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Datos: punta caliente <strong className="text-white">{String(row.signo)}</strong>, ρ = <strong className="num text-white">{fmtSci(Number(row.rho), 2)} Ω·cm</strong>.
              </p>
              <div>
                <div className="mb-1.5 text-sm font-medium text-slate-300">Tipo de semiconductor</div>
                <div className="grid grid-cols-2 gap-2">
                  {['N', 'P'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={guessType === t}
                      onClick={() => update((r) => ({ extra: { ...r.extra, [`${active}_tipo`]: t, [`${active}_ok`]: '' } }))}
                      className={`rounded-xl border py-2.5 font-semibold ${guessType === t ? 'border-cyan-400/70 bg-cyan-400/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
                    >
                      Tipo {t}
                    </button>
                  ))}
                </div>
              </div>
              <Slider
                label="Concentración estimada"
                value={guessLog}
                min={13}
                max={18}
                step={0.05}
                onChange={(v) => update((r) => ({ extra: { ...r.extra, [`${active}_logN`]: v, [`${active}_ok`]: '' } }))}
                display={`${fmtSci(10 ** guessLog, 1)} cm⁻³`}
                color="#fbbf24"
                hint="Mueve la línea amarilla hasta que corte la curva del tipo elegido a la altura de tu ρ."
              />
              <button type="button" className="btn-primary w-full" disabled={!guessType} onClick={check}>
                Comprobar identificación
              </button>
              {checked === 'sí' && truth && (
                <p className="flex gap-2 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-100" role="status">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-300" aria-hidden />
                  ¡Correcto! {active} es Si tipo {truth.dopant === 'fosforo' ? 'N (fósforo)' : 'P (boro)'} con N = {fmtSci(truth.N, 1)} cm⁻³.
                </p>
              )}
              {(checked === 'tipo' || checked === 'no') && (
                <p className="flex gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-100" role="status">
                  <XCircle size={18} className="shrink-0 text-amber-300" aria-hidden />
                  {checked === 'tipo' ? 'El tipo es correcto, pero la concentración está lejos (más de un factor 2). Usa la curva del tipo elegido.' : 'Revisa el signo de la punta caliente: (+) indica electrones mayoritarios.'}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const summary = (
    <table className="w-full text-sm text-slate-200">
      <thead>
        <tr className="border-b border-white/10 text-left text-xs text-slate-400">
          <th className="py-1.5 pr-3">Muestra</th>
          <th className="py-1.5 pr-3">Tu tipo</th>
          <th className="py-1.5 pr-3">Tu N estimada</th>
          <th className="py-1.5">Resultado</th>
        </tr>
      </thead>
      <tbody className="num divide-y divide-white/5">
        {rec.rows.map((r) => {
          const id = String(r.muestra);
          const ok = rec.extra[`${id}_ok`];
          return (
            <tr key={id}>
              <td className="py-1.5 pr-3">{id}</td>
              <td className="py-1.5 pr-3">{rec.extra[`${id}_tipo`] ? `Tipo ${rec.extra[`${id}_tipo`]}` : '—'}</td>
              <td className="py-1.5 pr-3">{rec.extra[`${id}_logN`] !== undefined ? `${fmtSci(10 ** Number(rec.extra[`${id}_logN`]), 1)} cm⁻³` : '—'}</td>
              <td className="py-1.5">{ok === 'sí' ? 'Correcto' : ok ? 'Por corregir' : 'Sin comprobar'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return <PracticeShell def={def} rec={rec} update={update} reset={reset} bench={bench} analysis={analysis} summary={summary} />;
}
