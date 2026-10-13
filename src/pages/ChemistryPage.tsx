import { Atom, Cpu, Layers, Sparkles, Sun, Thermometer } from 'lucide-react';
import { useState } from 'react';
import { MaterialCurves } from '../components/charts/MaterialCurves';
import { BandDiagram } from '../components/science/BandDiagram';
import { BondingMotif } from '../components/science/BondingMotif';
import { Card } from '../components/ui/Card';
import { ChemistryExplainer, type ExplainerLayer } from '../components/ui/ChemistryExplainer';
import { Collapsible } from '../components/ui/Collapsible';
import { DataTag } from '../components/ui/DataTag';
import { Equation } from '../components/ui/Equation';
import { PageHeader } from '../components/ui/PageHeader';
import { RefCite } from '../components/ui/RefCite';
import { Segmented } from '../components/ui/Segmented';
import { Slider } from '../components/ui/Slider';
import { Stat } from '../components/ui/Stat';
import { useSimulation } from '../context/SimulationContext';
import { MATERIAL_LIST, MATERIALS, PEROVSKITE } from '../data/materials';
import { toCelsius, toKelvin } from '../science/constants';
import {
  bandgapVarshni,
  boltzmannFactor,
  conceptualCarrierCount,
  electronMobility,
  holeMobility,
  intrinsicConcentration,
  intrinsicConductivity,
  thermalEnergy,
} from '../science/semiconductor';
import type { MaterialId } from '../types';
import { fmt, fmtSci } from '../utils/format';

function MaterialCard({ id }: { id: MaterialId }) {
  const m = MATERIALS[id];
  return (
    <article className="panel flex flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b border-white/[0.06] p-4" style={{ background: `linear-gradient(90deg, ${m.color}22, transparent)` }}>
        <BondingMotif material={id} />
        <div>
          <div className="font-mono text-3xl font-bold text-white">{m.formula}</div>
          <h3 className="text-lg font-semibold">{m.name}</h3>
          <div className="text-xs text-slate-400">{m.group}</div>
        </div>
      </div>
      <div className="flex-1 space-y-3 p-4 text-sm">
        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.03] p-2">
            <dt className="text-[11px] text-slate-400">Banda prohibida (300 K)</dt>
            <dd className="num text-lg font-semibold text-white">{fmt(m.eg300.value, 2)} eV</dd>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2">
            <dt className="text-[11px] text-slate-400">Tipo de banda</dt>
            <dd className="text-lg font-semibold capitalize text-white">{m.gapType}</dd>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2">
            <dt className="text-[11px] text-slate-400">Estructura</dt>
            <dd className="font-semibold text-white">{m.structure}</dd>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2">
            <dt className="text-[11px] text-slate-400">Constante de red</dt>
            <dd className="num font-semibold text-white">{fmt(m.latticeConstant.value, 3)} Å</dd>
          </div>
        </dl>
        <p className="text-slate-300">
          <strong className="text-slate-100">Composición:</strong> {m.composition}
        </p>
        <p className="text-slate-300">
          <strong className="text-slate-100">Enlace:</strong> {m.bonding}
        </p>
        <Collapsible title="Propiedades electrónicas y aplicaciones">
          <ul className="list-disc space-y-1 pl-5">
            {m.electronic.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <div className="mt-2 font-semibold text-slate-100">Aplicaciones</div>
          <ul className="list-disc space-y-1 pl-5">
            {m.applications.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Collapsible>
        <Collapsible title="Ventajas y limitaciones">
          <div className="grid gap-3 sm:grid-cols-2">
            <ul className="space-y-1">
              {m.advantages.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className="text-emerald-300">+</span>
                  {e}
                </li>
              ))}
            </ul>
            <ul className="space-y-1">
              {m.limitations.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className="text-red-300">−</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </Collapsible>
        <div className="flex items-center gap-2 pt-1">
          <DataTag kind="publicado" /> <RefCite ids={m.eg300.refs.concat(['kittel'])} />
        </div>
      </div>
    </article>
  );
}

export function ChemistryPage() {
  const { state } = useSimulation();
  const [material, setMaterial] = useState<MaterialId>('si');
  const [T, setT] = useState(300);
  const m = MATERIALS[material];
  const eg = bandgapVarshni(material, T);
  const kT = thermalEnergy(T);
  const ni = intrinsicConcentration(material, T);
  const muN = electronMobility(material, T);
  const muP = holeMobility(material, T);
  const sigma = intrinsicConductivity(material, T);
  const sigma300 = intrinsicConductivity(material, 300);
  const excited = conceptualCarrierCount(ni);

  const layers: ExplainerLayer[] = [
    {
      level: 'material',
      key: `${material}-${Math.round(T / 50)}`,
      text: `A ${T} K (${fmt(toCelsius(T), 0)} °C) los átomos vibran con energía característica k·T ≈ ${fmt(kT * 1000, 1)} meV. Eg del ${m.name.toLowerCase()} es ${fmt(eg / kT, 0)} veces mayor, así que sólo una fracción muy pequeña de electrones de enlace se excita: por eso nᵢ depende exponencialmente de Eg/(2kT).`,
    },
    {
      level: 'dispositivo',
      key: `${material}-${T > 300 ? 'h' : 'c'}`,
      text:
        T >= 300
          ? `Al calentar aumentan los portadores (nᵢ ×${fmtSci(ni / intrinsicConcentration(material, 300), 1)} vs. 300 K) pero la movilidad baja a ${fmt(muN, 0)} cm²/(V·s) por la vibración de la red. En el material intrínseco gana el aumento de portadores (σ ×${fmtSci(sigma / sigma300, 1)}); en un material dopado puede ganar la pérdida de movilidad.`
          : `Al enfriar se generan menos pares electrón-hueco; la movilidad sube porque la red vibra menos. En material intrínseco la conductividad cae (σ ×${fmtSci(sigma / sigma300, 1)} vs. 300 K).`,
    },
    {
      level: 'chip',
      key: material,
      text: `En el chip virtual estos efectos ocurren en cada transistor. Un chip a mayor temperatura tiene más fugas y circuitos algo más lentos; por eso se refrigera. La temperatura del chip la fija sobre todo el balance entre potencia y refrigeración, no sólo el material.`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo 2 · Química de semiconductores"
        icon={Atom}
        title="¿Qué ocurre dentro del semiconductor?"
        description="Los semiconductores son sólidos con enlaces covalentes cuyos electrones necesitan una energía mínima —la banda prohibida— para moverse libremente. La temperatura aporta parte de esa energía."
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Controles" icon={Thermometer} className="xl:col-span-4 2xl:col-span-3">
          <div className="space-y-5">
            <Segmented<MaterialId> label="Material" value={material} onChange={setMaterial} options={MATERIAL_LIST.map((x) => ({ value: x.id, label: x.formula, hint: x.name, color: x.color }))} />
            <Slider
              label="Temperatura del material"
              value={T}
              min={200}
              max={600}
              step={5}
              onChange={setT}
              display={`${T} K`}
              hint={`${fmt(toCelsius(T), 0)} °C · rango del modelo: 200–600 K`}
              color="#fb923c"
              minLabel="200 K (−73 °C)"
              maxLabel="600 K (327 °C)"
            />
            <button type="button" className="btn-ghost w-full" onClick={() => setT(Math.round(toKelvin(state.T) / 5) * 5)}>
              <Cpu size={16} aria-hidden /> Usar temperatura del chip ({fmt(state.T, 0)} °C)
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Eg(T)" value={fmt(eg, 3)} unit="eV" kind="calculado" size="sm" />
              <Stat label="k·T" value={fmt(kT * 1000, 1)} unit="meV" kind="calculado" size="sm" />
              <Stat label="nᵢ" value={fmtSci(ni)} unit="cm⁻³" kind="calculado" size="sm" />
              <Stat label="exp(−Eg/2kT)" value={fmtSci(boltzmannFactor(eg, T))} kind="calculado" size="sm" />
              <Stat label="μn" value={fmt(muN, 0)} unit="cm²/V·s" kind="calculado" size="sm" />
              <Stat label="μp" value={fmt(muP, 0)} unit="cm²/V·s" kind="calculado" size="sm" />
            </div>
            <Stat label="Conductividad intrínseca σᵢ" value={fmtSci(sigma, 2)} unit="S/cm" kind="calculado" sub={`×${fmtSci(sigma / sigma300, 1)} respecto a 300 K`} />
          </div>
        </Card>

        <Card
          title={`Diagrama de bandas: ${m.name}`}
          subtitle="Los electrones (●) saltan de la banda de valencia a la de conducción y dejan huecos (○)"
          icon={Layers}
          accent="violet"
          className="xl:col-span-8 2xl:col-span-9"
          actions={<DataTag kind="conceptual" />}
        >
          <BandDiagram eg={eg} kT={kT} excited={excited} color={m.color} label={m.name} />
          <p className="mt-2 text-xs text-slate-400">
            Altura de Eg a escala real (eV). El número de electrones dibujados sigue una escala logarítmica conceptual de nᵢ: en 1 cm³ de {m.formula} a {T} K hay ≈ {fmtSci(ni)} electrones
            libres intrínsecos, frente a ~10²² átomos.
          </p>
        </Card>
      </div>

      <ChemistryExplainer layers={layers} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Banda prohibida frente a temperatura" subtitle="Ecuación de Varshni con parámetros publicados" icon={Sparkles} actions={<DataTag kind="calculado" />}>
          <MaterialCurves kind="eg" currentT={T} highlight={material} />
        </Card>
        <Card title="Portadores intrínsecos nᵢ(T)" subtitle="Escala logarítmica: cada marca es ×1000" icon={Sparkles} actions={<DataTag kind="calculado" />}>
          <MaterialCurves kind="ni" currentT={T} highlight={material} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Equation
          name="Ecuación de Varshni"
          refs={['varshni', 'ioffe']}
          vars={[
            { sym: 'Eg(0)', desc: `Banda prohibida a 0 K (${m.formula}: ${m.varshni.eg0} eV)`, unit: 'eV' },
            { sym: 'α', desc: `Parámetro empírico (${m.varshni.alpha.toExponential(3)})`, unit: 'eV/K' },
            { sym: 'β', desc: `Parámetro empírico, relacionado con la T de Debye (${m.varshni.beta})`, unit: 'K' },
            { sym: 'T', desc: 'Temperatura absoluta', unit: 'K' },
          ]}
          validity="Si, Ge y GaAs entre ~0 y 600 K. No describe a las perovskitas de haluro."
        >
          Eg(T) = Eg(0) − α·T² / (T + β)
        </Equation>
        <Equation
          name="Concentración intrínseca"
          refs={['sze', 'ioffe']}
          vars={[
            { sym: 'Nc, Nv', desc: 'Densidades efectivas de estados (∝ T^3/2)', unit: 'cm⁻³' },
            { sym: 'k_B', desc: 'Constante de Boltzmann, 8,617·10⁻⁵', unit: 'eV/K' },
            { sym: 'nᵢ', desc: 'Electrones libres = huecos en material puro', unit: 'cm⁻³' },
          ]}
          validity="semiconductor no degenerado; error típico < factor 2 frente a valores medidos."
        >
          nᵢ = √(Nc·Nv) · e<sup>−Eg/(2·k_B·T)</sup>
        </Equation>
        <Equation
          name="Conductividad y movilidad"
          refs={['sze']}
          vars={[
            { sym: 'q', desc: 'Carga elemental, 1,602·10⁻¹⁹', unit: 'C' },
            { sym: 'μ', desc: 'Movilidad de electrones (n) o huecos (p)', unit: 'cm²/(V·s)' },
            { sym: 'γ', desc: `Exponente de red (${m.formula}: ${m.muNExp} / ${m.muPExp})` },
          ]}
          validity="dispersión por la red dominante, cerca de 300 K y bajo dopaje (aproximación)."
        >
          σ = q·(n·μn + p·μp), μ(T) = μ₃₀₀·(T/300)<sup>−γ</sup>
        </Equation>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Fichas de materiales</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {MATERIAL_LIST.map((x) => (
            <MaterialCard key={x.id} id={x.id} />
          ))}
        </div>
      </section>

      <Card title="Perovskitas semiconductoras" subtitle={`${PEROVSKITE.formula} · fórmula general ${PEROVSKITE.general}`} icon={Sun} accent="amber" actions={<RefCite ids={PEROVSKITE.refs} />}>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56" role="img" aria-label="Estructura de perovskita ABX3: octaedro PbI6 con catión orgánico en la cavidad">
            <rect x="20" y="20" width="160" height="160" fill="none" stroke="rgba(201,133,0,0.5)" strokeDasharray="4 4" />
            {[
              [20, 20],
              [180, 20],
              [20, 180],
              [180, 180],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="13" fill="#199e70" fillOpacity="0.3" stroke="#199e70" strokeWidth="1.5" />
                <text x={x} y={y + 4} fontSize="9" textAnchor="middle" fill="#fff" fontWeight="700">
                  MA⁺
                </text>
              </g>
            ))}
            <polygon points="100,40 160,100 100,160 40,100" fill="rgba(201,133,0,0.18)" stroke="#c98500" strokeWidth="2" />
            {[
              [100, 40],
              [160, 100],
              [100, 160],
              [40, 100],
            ].map(([x, y]) => (
              <g key={`i-${x}-${y}`}>
                <circle cx={x} cy={y} r="11" fill="#7c3aed" fillOpacity="0.4" stroke="#a78bfa" strokeWidth="1.5" />
                <text x={x} y={y + 4} fontSize="10" textAnchor="middle" fill="#fff" fontWeight="700">
                  I⁻
                </text>
              </g>
            ))}
            <circle cx="100" cy="100" r="15" fill="#64748b" stroke="#e2e8f0" strokeWidth="1.5" />
            <text x="100" y="104" fontSize="11" textAnchor="middle" fill="#fff" fontWeight="700">
              Pb²⁺
            </text>
          </svg>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <strong className="text-white">Estructura:</strong> {PEROVSKITE.structure}
            </p>
            <p>
              <strong className="text-white">Enlace:</strong> {PEROVSKITE.bonding}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Stat label="Banda prohibida" value={`${fmt(PEROVSKITE.eg.min, 2)}–${fmt(PEROVSKITE.eg.max, 2)}`} unit="eV" kind="publicado" />
              <Stat label="Conductividad térmica" value={`≈ ${fmt(PEROVSKITE.thermalConductivity.value, 1)}`} unit="W/(m·K)" kind="publicado" />
              <Stat label="Eficiencia récord (celda)" value="> 26" unit="%" kind="publicado" sub="tándem con Si: > 33 %" />
            </div>
            <p>{PEROVSKITE.egTunable}</p>
            <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-amber-100/90">{PEROVSKITE.temperatureNote}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ul className="space-y-1">
                {PEROVSKITE.advantages.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span className="text-emerald-300">+</span>
                    {e}
                  </li>
                ))}
              </ul>
              <ul className="space-y-1">
                {PEROVSKITE.limitations.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span className="text-red-300">−</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
