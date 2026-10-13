import { motion } from 'framer-motion';
import { ArrowRight, Atom, Cpu, Microscope, Radio, Ruler, Smartphone, Sparkles, Sun, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { TransistorDiagram } from '../components/science/TransistorDiagram';
import { Card } from '../components/ui/Card';
import { ChemistryExplainer } from '../components/ui/ChemistryExplainer';
import { DataTag } from '../components/ui/DataTag';
import { Equation } from '../components/ui/Equation';
import { PageHeader } from '../components/ui/PageHeader';
import { RefCite } from '../components/ui/RefCite';
import { Segmented } from '../components/ui/Segmented';
import { Slider } from '../components/ui/Slider';
import { Stat } from '../components/ui/Stat';
import { useSimulation } from '../context/SimulationContext';
import { ARCHITECTURES, SIZE_SCALE, TIC_APPLICATIONS, type Architecture } from '../data/nanotech';
import { DIE } from '../data/thermalConfig';
import { absorptionWavelength, brusEnergy, energyToWavelength, wavelengthToEnergy, wavelengthToRgb, YU_RANGE } from '../science/quantumDots';
import { fmt } from '../utils/format';

const APP_ICON: Record<string, typeof Cpu> = { chips: Cpu, sensores: Radio, moviles: Smartphone, solar: Sun, cuantica: Atom };

/** Fracción de átomos en la superficie de una esfera de diámetro D (capa de espesor a). */
function surfaceFraction(Dnm: number, a = 0.27): number {
  if (Dnm <= 2 * a) return 1;
  return 1 - ((Dnm - 2 * a) / Dnm) ** 3;
}

function SizeScale() {
  const min = Math.log10(0.1e-9);
  const max = Math.log10(200e-6);
  const pos = (m: number) => ((Math.log10(m) - min) / (max - min)) * 100;
  return (
    <div className="space-y-4">
      <div className="relative h-24">
        <div className="absolute inset-x-0 top-10 h-2 rounded-full bg-gradient-to-r from-violet-500/50 via-cyan-400/50 to-slate-500/40" />
        <div className="absolute top-6 h-10 rounded-lg border-2 border-cyan-300/70 bg-cyan-300/10" style={{ left: `${pos(1e-9)}%`, width: `${pos(100e-9) - pos(1e-9)}%` }}>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-cyan-200">Nanoescala: 1–100 nm</span>
        </div>
        {SIZE_SCALE.map((s, i) => (
          <div key={s.label} className="absolute top-[34px] -translate-x-1/2" style={{ left: `${pos(s.meters)}%` }}>
            <div className="mx-auto h-5 w-0.5 bg-white" />
            <div className={`mt-1 w-20 text-center text-[10px] leading-tight text-slate-300 sm:w-24 sm:text-[11px] ${i % 2 ? 'translate-y-5' : ''}`}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="relative mt-8 h-4 font-mono text-[11px] text-slate-500">
        {[
          [0.1e-9, '0,1 nm'],
          [1e-9, '1 nm'],
          [10e-9, '10 nm'],
          [100e-9, '100 nm'],
          [1e-6, '1 µm'],
          [10e-6, '10 µm'],
          [100e-6, '100 µm'],
        ].map(([m, l]) => (
          <span key={l as string} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${pos(m as number)}%` }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function NanoPage() {
  const { derived } = useSimulation();
  const [D, setD] = useState(4);
  const [arch, setArch] = useState<Architecture['id']>('finfet');
  const lambda = absorptionWavelength(D);
  const eExp = wavelengthToEnergy(lambda);
  const eBrus = brusEnergy(D / 2);
  const color = wavelengthToRgb(lambda);
  const a = ARCHITECTURES.find((x) => x.id === arch) ?? ARCHITECTURES[0];
  const powerDensity = derived.power.effective / (DIE.areaM2 * 1e4);
  const surf = surfaceFraction(D);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo 5 · Nanomateriales y TIC"
        icon={Microscope}
        title="Cuando el tamaño cambia las propiedades"
        description="Un nanomaterial tiene al menos una dimensión entre 1 y 100 nm. A esa escala la superficie y el confinamiento cuántico pueden modificar propiedades ópticas, electrónicas y térmicas."
      />

      <Card title="¿Qué tan pequeño es «nano»?" icon={Ruler} actions={<DataTag kind="publicado" />}>
        <SizeScale />
        <p className="mt-2 text-xs text-slate-400">Escala logarítmica: cada división multiplica el tamaño. Valores de orden de magnitud.</p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Experimento: puntos cuánticos de CdSe" subtitle="El mismo compuesto, distinto tamaño → distinto color" icon={Sparkles} accent="violet" className="xl:col-span-7">
          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <Slider label="Diámetro del nanocristal" value={D} min={YU_RANGE.minD} max={YU_RANGE.maxD} step={0.1} onChange={setD} display={`${fmt(D, 1)} nm`} color={color} minLabel="2 nm" maxLabel="8 nm" />
              <div className="grid grid-cols-2 gap-2">
                <Stat label="λ de absorción (empírica)" value={fmt(lambda, 0)} unit="nm" kind="calculado" sub="Yu et al. (2003)" />
                <Stat label="Energía (empírica)" value={fmt(eExp, 2)} unit="eV" kind="calculado" sub={`CdSe sólido: 1,74 eV`} />
                <Stat label="Energía (modelo de Brus)" value={fmt(eBrus, 2)} unit="eV" kind="calculado" sub={`≈ ${fmt(energyToWavelength(eBrus), 0)} nm`} />
                <Stat label="Átomos en la superficie" value={fmt(surf * 100, 0)} unit="%" kind="calculado" sub="capa de ≈ 0,27 nm (aprox.)" />
              </div>
              <p className="text-sm text-slate-300">
                Al reducir el tamaño, el electrón y el hueco quedan «encerrados» (confinamiento cuántico): la energía para excitarlos aumenta y el cristal absorbe luz de menor longitud de
                onda. El modelo de Brus sobrestima la energía en cristales pequeños; por eso también mostramos la relación experimental <RefCite ids={['brus', 'yu']} />.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div
                className="rounded-full transition-all duration-300"
                style={{ width: 40 + D * 18, height: 40 + D * 18, backgroundColor: color, boxShadow: `0 0 60px ${color}` }}
                role="img"
                aria-label={`Nanocristal de ${fmt(D, 1)} nm que absorbe a ${fmt(lambda, 0)} nm`}
              />
              <span className="text-center text-xs text-slate-400">Color aproximado de la longitud de onda absorbida (el emitido es algo más rojo)</span>
              <DataTag kind="conceptual" />
            </div>
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-5">
          <Equation
            name="Confinamiento cuántico (Brus, 1984)"
            refs={['brus']}
            vars={[
              { sym: 'R', desc: 'Radio del nanocristal', unit: 'nm' },
              { sym: 'mₑ*, mₕ*', desc: 'Masas efectivas (CdSe: 0,13 y 0,45 m₀)' },
              { sym: 'ε', desc: 'Constante dieléctrica (CdSe: 10,6)' },
            ]}
            validity="aproximación de masa efectiva; sobrestima E para R < ~2 nm."
          >
            E(R) = Eg + ħ²π²/(2R²)·(1/mₑ* + 1/mₕ*) − 1,786·e²/(4πε₀εR)
          </Equation>
          <div className="flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-amber-100/90">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
            <p>
              <strong>Una estructura nanométrica no cambia automáticamente todas las propiedades.</strong> El confinamiento sólo es notable cuando el tamaño se acerca al radio de Bohr del
              excitón del material (≈ 5–6 nm en CdSe; ≈ 5 nm en Si). Los efectos dependen de la composición, las dimensiones y la arquitectura.
            </p>
          </div>
        </div>
      </div>

      <Card title="Arquitecturas nanoelectrónicas del transistor" subtitle="Cómo la industria mantiene el control del canal al miniaturizar" icon={Cpu} actions={<RefCite ids={['irds']} />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Segmented<Architecture['id']> value={arch} onChange={setArch} options={ARCHITECTURES.map((x) => ({ value: x.id, label: x.name }))} />
            <div className="rounded-2xl border border-white/[0.07] bg-lab-950/40 p-3">
              <TransistorDiagram arch={arch} />
            </div>
            <div className="flex justify-end">
              <DataTag kind="conceptual" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{a.era}</div>
            <h3 className="text-2xl font-semibold">{a.name}</h3>
            <p className="font-semibold text-amber-200">{a.gateSides}</p>
            <p className="text-slate-300">{a.description}</p>
            <ul className="space-y-1 text-sm text-slate-300">
              {a.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <ArrowRight size={14} className="mt-1 shrink-0 text-cyan-300" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-orange-400/25 bg-orange-400/[0.06] p-4 text-sm">
              <div className="font-semibold text-orange-200">Conexión con el chip virtual</div>
              <p className="mt-1 text-slate-300">
                Cada núcleo N1–N8 del chip representa miles de millones de transistores. Al concentrar más transistores en menos área crece la densidad de potencia: ahora tu chip virtual
                disipa <span className="num font-semibold text-white">{fmt(powerDensity, 0)} W/cm²</span> <DataTag kind="calculado" compact /> sobre su dado de 1,5 cm². Por eso la
                gestión térmica es un problema central de la nanoelectrónica <RefCite ids={['pop']} />.
              </p>
              <a href="#/simulador" className="mt-2 inline-flex items-center gap-1 font-semibold text-cyan-300 hover:underline">
                Ir al simulador <ArrowRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Aplicaciones en tecnologías de la información</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TIC_APPLICATIONS.map((app, i) => {
            const Icon = APP_ICON[app.id] ?? Cpu;
            return (
              <motion.article key={app.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="panel flex flex-col p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold">{app.title}</h3>
                </div>
                <dl className="mt-3 flex-1 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Materiales</dt>
                    <dd className="text-slate-200">{app.materials}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Escala nano</dt>
                    <dd className="text-slate-300">{app.nano}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Química</dt>
                    <dd className="text-slate-300">{app.chemistry}</dd>
                  </div>
                </dl>
                {app.link && (
                  <a href={app.link.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:underline">
                    {app.link.label} <ArrowRight size={14} aria-hidden />
                  </a>
                )}
              </motion.article>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Fuentes: <RefCite ids={['irds', 'pop', 'green', 'nrel', 'zwanenburg', 'sze']} />
        </p>
      </section>

      <ChemistryExplainer
        layers={[
          {
            level: 'material',
            key: `qd-${Math.round(D)}`,
            text: `En un nanocristal de ${fmt(D, 1)} nm, cerca del ${fmt(surf * 100, 0)} % de los átomos está en la superficie, con enlaces incompletos que la química de superficie (ligandos) debe estabilizar. Además, los niveles de energía se separan por confinamiento.`,
          },
          {
            level: 'dispositivo',
            key: `arch-${arch}`,
            text: `En un ${a.name} el canal de silicio mide pocos nanómetros. Rodearlo con la puerta (${a.gateSides.toLowerCase()}) mantiene el control de los portadores y reduce las fugas.`,
          },
          {
            level: 'chip',
            key: 'chip-nano',
            text: `Miniaturizar permite más transistores por chip, pero concentra el calor: el chip virtual disipa ahora ${fmt(derived.power.effective, 0)} W en 1,5 cm². Sin una buena refrigeración la temperatura subiría hasta el límite.`,
          },
        ]}
      />
    </div>
  );
}
