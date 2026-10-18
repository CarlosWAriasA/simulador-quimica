import { motion } from 'framer-motion';
import { Flame, Gauge, NotebookPen, Thermometer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DataTag } from '../../components/ui/DataTag';
import { Equation } from '../../components/ui/Equation';
import { Segmented } from '../../components/ui/Segmented';
import { Slider } from '../../components/ui/Slider';
import { MATERIAL_LIST, MATERIALS } from '../../data/materials';
import { K_B_EV, toCelsius } from '../../science/constants';
import { bandgapVarshni } from '../../science/semiconductor';
import { linearFit, percentError, toSignificant } from '../../science/stats';
import type { MaterialId } from '../../types';
import { temperatureColor } from '../../utils/color';
import { fmt } from '../../utils/format';
import { Instrument } from '../components/Instrument';
import { PracticeShell } from '../components/PracticeShell';
import { ScatterFit } from '../components/ScatterFit';
import { PRACTICE_BY_ID } from '../practices';
import { usePracticeRecord } from '../storage';
import { ResultTile } from './Practice1';
import { OHM_MAX, barResistance } from '../models';

/** Constante de tiempo del horno [s reales]. */
const OVEN_TAU = 1.4;

function ohms(R: number): { value: string; unit: string } {
  if (R >= OHM_MAX) return { value: 'OL', unit: '' };
  const r = toSignificant(R, 4);
  if (r >= 1e9) return { value: fmt(r / 1e9, 3), unit: 'GΩ' };
  if (r >= 1e6) return { value: fmt(r / 1e6, 3), unit: 'MΩ' };
  if (r >= 1e3) return { value: fmt(r / 1e3, 3), unit: 'kΩ' };
  return { value: fmt(r, 2), unit: 'Ω' };
}

function useOven(setK: number) {
  const [ovenK, setOvenK] = useState(295);
  const target = useRef(setK);
  target.current = setK;
  useEffect(() => {
    const id = window.setInterval(() => {
      setOvenK((k) => {
        const next = k + (target.current - k) * (1 - Math.exp(-0.1 / OVEN_TAU));
        return Math.abs(next - target.current) < 0.02 ? target.current : next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, []);
  return ovenK;
}

function OvenGraphic({ T, color, label }: { T: number; color: string; label: string }) {
  const glow = temperatureColor(toCelsius(T));
  const heat = Math.max(0, Math.min(1, (T - 300) / 200));
  return (
    <svg viewBox="0 0 360 240" className="h-auto w-full" role="img" aria-label={`Horno a ${fmt(T, 0)} K con barra de ${label}`}>
      <rect x="20" y="30" width="320" height="170" rx="18" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      <rect x="44" y="54" width="272" height="122" rx="10" fill="#0b1220" stroke="#334155" />
      <rect x="44" y="54" width="272" height="122" rx="10" fill={glow} opacity={0.12 + heat * 0.45} style={{ transition: 'fill .5s, opacity .5s' }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${70 + i * 55} 168 q 8 -8 0 -16 q -8 -8 0 -16`} stroke={glow} strokeWidth="3" fill="none" opacity={0.3 + heat * 0.6} />
      ))}
      <rect x="110" y="104" width="140" height="20" rx="3" fill={color} stroke="#e2e8f0" strokeWidth="1.5" />
      <text x="180" y="119" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
        {label}
      </text>
      <circle cx="110" cy="114" r="5" fill="#fbbf24" />
      <circle cx="250" cy="114" r="5" fill="#fbbf24" />
      <path d="M 110 114 C 70 114 60 220 20 226" stroke="#ef4444" strokeWidth="3" fill="none" />
      <path d="M 250 114 C 290 114 300 220 340 226" stroke="#0f172a" strokeWidth="3" fill="none" />
      <path d="M 250 114 C 290 114 300 220 340 226" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
      <text x="180" y="22" textAnchor="middle" fontSize="13" fill="#94a3b8">
        Horno de laboratorio
      </text>
      <rect x="138" y="182" width="84" height="14" rx="7" fill="#0f172a" />
      <rect x="138" y="182" width={84 * heat} height="14" rx="7" fill={glow} />
    </svg>
  );
}

export function Practice3() {
  const def = PRACTICE_BY_ID.p3;
  const { rec, update, reset } = usePracticeRecord('p3');
  const [sample, setSample] = useState<MaterialId>('ge');
  const [setK, setSetK] = useState(300);
  const ovenK = useOven(setK);
  const stable = Math.abs(ovenK - setK) < 0.3;
  const R = barResistance(sample, ovenK);
  const over = R >= OHM_MAX;
  const reading = ohms(R);
  const m = MATERIALS[sample];
  const [flash, setFlash] = useState<string | null>(null);
  const [view, setView] = useState<MaterialId | null>(null);

  const record = () => {
    if (over || !stable) return;
    const T = Math.round(ovenK * 10) / 10;
    const Rm = toSignificant(R, 4);
    const row = { muestra: m.formula, T, R: Rm, invT: Math.round((1000 / T) * 10000) / 10000, lnG: Math.round(Math.log(1 / Rm) * 10000) / 10000 };
    update((r) => ({ rows: [...r.rows, row] }));
    setFlash(`Anotado: ${m.formula} a ${fmt(T, 1)} K → ${reading.value} ${reading.unit}`);
    setView(sample);
  };

  const samples = MATERIAL_LIST.filter((x) => rec.rows.some((r) => r.muestra === x.formula));
  const current = view && samples.some((s) => s.id === view) ? MATERIALS[view] : samples[0];
  const rows = current ? rec.rows.filter((r) => r.muestra === current.formula) : [];
  const pts = rows.map((r) => ({ x: Number(r.invT), y: Number(r.lnG) }));
  const fit = linearFit(pts.map((p) => p.x), pts.map((p) => p.y));
  const egMeasured = fit ? -2 * K_B_EV * 1000 * fit.slope : NaN;

  const bench = (
    <section className="panel-strong p-4 sm:p-6" aria-label="Banco de trabajo">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Segmented<MaterialId>
            label="Muestra (barra intrínseca)"
            value={sample}
            onChange={setSample}
            options={MATERIAL_LIST.map((x) => ({ value: x.id, label: `${x.formula}`, hint: x.name, color: x.color }))}
          />
          <OvenGraphic T={ovenK} color={m.color} label={m.formula} />
          <Slider
            label="Temperatura del horno (consigna)"
            value={setK}
            min={290}
            max={500}
            step={5}
            onChange={setSetK}
            display={`${setK} K`}
            hint={`${fmt(toCelsius(setK), 0)} °C`}
            color="#f97316"
            large
          />
        </div>
        <div className="space-y-4">
          <Instrument
            label="Termopar del horno"
            icon={Thermometer}
            value={fmt(ovenK, 1)}
            unit="K"
            led={{ on: stable, label: stable ? 'Estable' : 'Calentando…', color: stable ? '#34d399' : '#f59e0b' }}
            hint={`${fmt(toCelsius(ovenK), 1)} °C`}
          />
          <Instrument
            label="Multímetro · Ω"
            icon={Gauge}
            value={reading.value}
            unit={reading.unit}
            large
            hint={over ? 'Fuera de rango: la barra casi no conduce a esta temperatura. Caliéntala más.' : 'Resistencia de la barra (4 cifras significativas)'}
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={record}
            disabled={over || !stable}
            className="btn w-full bg-emerald-400 text-base text-lab-950 hover:bg-emerald-300"
          >
            <NotebookPen size={18} aria-hidden /> Registrar medición
          </motion.button>
          {(!stable || over) && (
            <p className="flex items-center gap-2 text-xs text-amber-200/90">
              <Flame size={14} aria-hidden /> {over ? 'No se puede registrar «OL».' : 'Espera a que el horno se estabilice.'}
            </p>
          )}
          {flash && (
            <motion.p key={flash} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-emerald-300" role="status">
              {flash}
            </motion.p>
          )}
          <p className="text-xs text-slate-500">Barra de 1 cm × 1 mm × 1 mm. R = L/(σ·A). Lecturas simuladas con el modelo de semiconductores intrínsecos.</p>
        </div>
      </div>
    </section>
  );

  const egRef300 = current ? current.eg300.value : NaN;
  const eg0 = current ? bandgapVarshni(current.id, 0) : NaN;

  const results = current && fit && (
    <div className="grid gap-3 sm:grid-cols-3">
      <ResultTile label={`Eg medida · ${current.formula}`} value={`${fmt(egMeasured, 3)} eV`} sub={`a partir de ${fit.n} puntos · R² = ${fmt(fit.r2, 4)}`} />
      <ResultTile label="Eg de tablas a 300 K" value={`${fmt(egRef300, 2)} eV`} sub={`Diferencia: ${fmt(percentError(egMeasured, egRef300), 1)} %`} />
      <ResultTile label="Eg(0 K) por Varshni" value={`${fmt(eg0, 3)} eV`} sub={`Diferencia: ${fmt(percentError(egMeasured, eg0), 1)} %`} />
    </div>
  );

  const analysis = (
    <div className="space-y-6">
      {samples.length > 1 && (
        <Segmented<MaterialId>
          label="Muestra a analizar"
          value={current?.id ?? 'si'}
          onChange={setView}
          options={samples.map((x) => ({ value: x.id, label: x.formula, color: x.color }))}
        />
      )}
      {current && fit ? (
        <>
          <Card title={`Gráfica de Arrhenius · ${current.name}`} subtitle="ln(G) frente a 1000/T: la pendiente revela la banda prohibida" actions={<DataTag kind="calculado" />}>
            <ScatterFit points={pts} fit={fit} xLabel="1000 / T  [K⁻¹]" yLabel="ln(G / S)" xDigits={2} yDigits={1} />
          </Card>
          {results}
          <div className="grid gap-4 lg:grid-cols-2">
            <Equation
              name="De la pendiente a la banda prohibida"
              refs={['sze']}
              vars={[
                { sym: 'G', desc: 'Conductancia = 1/R', unit: 'S' },
                { sym: 'm', desc: `Pendiente de tu ajuste: ${fmt(fit.slope, 3)}`, unit: 'K' },
                { sym: 'k_B', desc: 'Constante de Boltzmann 8,617·10⁻⁵', unit: 'eV/K' },
              ]}
              validity="semiconductor intrínseco; se desprecian las variaciones de T^3/2 y de la movilidad."
            >
              ln G ≈ cte − (Eg/2k<sub>B</sub>)·(1/T) ⇒ Eg = −2·k<sub>B</sub>·1000·m
            </Equation>
            <Card title="¿Qué significa?" accent="violet">
              <p className="text-sm leading-relaxed text-slate-300">
                Cada punto es una temperatura distinta. Al calentar, más electrones de los enlaces covalentes del {current.name.toLowerCase()} saltan a la banda de conducción y la
                barra conduce más. La rapidez con que crece la conducción depende de cuánta energía cuesta romper un enlace: esa energía es la banda prohibida. Tu valor (
                {fmt(egMeasured, 2)} eV) se parece más a Eg extrapolada a 0 K ({fmt(eg0, 2)} eV) que a Eg(300 K): como Eg disminuye al calentar, la pendiente de Arrhenius da un valor
                extrapolado, y además el método ignora los factores T<sup>3/2</sup> y de movilidad.
              </p>
            </Card>
          </div>
        </>
      ) : (
        <p className="panel p-6 text-slate-300">Necesitas al menos dos temperaturas distintas de la misma muestra para ajustar una recta.</p>
      )}
    </div>
  );

  const summary = current && fit ? (
    <div className="space-y-2 text-slate-300">
      {results}
      <p>
        La conductancia de la barra de {current.name.toLowerCase()} aumentó exponencialmente con la temperatura. Del ajuste ln(G) vs 1000/T (R² = {fmt(fit.r2, 4)}) se obtuvo Eg ≈{' '}
        {fmt(egMeasured, 3)} eV, comparable con {fmt(egRef300, 2)} eV (300 K) y {fmt(eg0, 3)} eV (0 K).
      </p>
    </div>
  ) : null;

  return <PracticeShell def={def} rec={rec} update={update} reset={reset} bench={bench} analysis={analysis} summary={summary} />;
}
