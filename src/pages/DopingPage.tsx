import { Cpu, FlaskConical, Grid3x3, Layers, LineChart as LineIcon, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { CarrierChart, ConductivityChart } from '../components/charts/CarrierCharts';
import { BandDiagram } from '../components/science/BandDiagram';
import { CrystalLattice } from '../components/science/CrystalLattice';
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
import { DOPANTS, DOPING_RANGE, DOPING_T_RANGE_K, siliconCarriers } from '../science/doping';
import { toCelsius, toKelvin } from '../science/constants';
import { bandgapVarshni, thermalEnergy } from '../science/semiconductor';
import type { DopantId } from '../types';
import { clamp, fmt, fmtSci } from '../utils/format';

/** Estado del módulo de dopaje (exportado para reutilizarlo en el modo presentación). */
export function useDopingModel(dopant: DopantId, logN: number, T: number) {
  const N = 10 ** logN;
  const r = siliconCarriers(dopant, N, T);
  const dopantCount = dopant === 'intrinseco' ? 0 : clamp(Math.round(logN - 12), 1, 6);
  const thermalPairs = clamp(Math.round((Math.log10(r.ni) - 9) * 1.2), 0, 6);
  const extra = dopant === 'intrinseco' ? 0 : clamp(Math.round(logN - 11), 1, 7);
  return { N, r, dopantCount, thermalPairs, extra };
}

export function DopingVisuals({ dopant, logN, T, compact = false }: { dopant: DopantId; logN: number; T: number; compact?: boolean }) {
  const { r, dopantCount, thermalPairs, extra } = useDopingModel(dopant, logN, T);
  if (compact) return <CrystalLattice dopant={dopant} dopantCount={dopantCount} thermalPairs={thermalPairs} />;
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.07] bg-lab-950/40 p-3">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-200">
          Red cristalina (2D) <DataTag kind="conceptual" compact />
        </div>
        <CrystalLattice dopant={dopant} dopantCount={dopantCount} thermalPairs={thermalPairs} />
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-lab-950/40 p-3">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-200">
          Bandas de energía y nivel de Fermi <DataTag kind="conceptual" compact />
        </div>
        <BandDiagram
          eg={bandgapVarshni('si', T)}
          kT={thermalEnergy(T)}
          excited={Math.min(thermalPairs, 5)}
          color="#3987e5"
          label="silicio"
          fermiShift={r.fermiShift}
          donorElectrons={dopant === 'fosforo' ? extra : 0}
          acceptorHoles={dopant === 'boro' ? extra : 0}
          height={360}
        />
      </div>
    </div>
  );
}

export function DopingPage() {
  const { state } = useSimulation();
  const [dopant, setDopant] = useState<DopantId>('fosforo');
  const [logN, setLogN] = useState(16);
  const [T, setT] = useState(300);
  const { N, r } = useDopingModel(dopant, logN, T);
  const d = DOPANTS[dopant];
  const minority = r.majority === 'electrones' ? 'huecos' : 'electrones';

  const layers: ExplainerLayer[] = [
    {
      level: 'material',
      key: dopant,
      text:
        dopant === 'intrinseco'
          ? 'El silicio puro tiene 4 electrones de valencia y forma 4 enlaces covalentes. Sólo la agitación térmica rompe algunos enlaces, creando pares electrón-hueco: n = p = nᵢ.'
          : `Un átomo de ${d.element} (${d.group}, ${d.valence} electrones de valencia) sustituye a un Si en la red. ${d.role} Basta ≈ ${fmt(d.ionizationMeV ?? 0, 0)} meV para liberarlo —apenas unas 1,7 veces k·T a 300 K (≈ 26 meV)—, por eso a temperatura ambiente casi todos los dopantes están ionizados.`,
    },
    {
      level: 'dispositivo',
      key: `${dopant}-${r.intrinsicRegime}`,
      text:
        dopant === 'intrinseco'
          ? `A ${T} K hay ≈ ${fmtSci(r.ni)} portadores por cm³: un aislante pobre. El dopaje permite fijar con precisión la conductividad y el tipo de portador.`
          : r.intrinsicRegime
            ? `A ${T} K la generación térmica (nᵢ ≈ ${fmtSci(r.ni)} cm⁻³) ya es comparable al dopaje: el material pierde su carácter ${d.type} y se comporta como intrínseco. Por eso los dispositivos tienen una temperatura máxima.`
            : `Material tipo ${d.type}: los ${r.majority} son mayoritarios (≈ ${fmtSci(r.majority === 'electrones' ? r.n : r.p)} cm⁻³) y los ${minority} minoritarios (≈ ${fmtSci(r.majority === 'electrones' ? r.p : r.n)} cm⁻³), porque n·p = nᵢ². La conductividad es ${fmtSci(r.sigma / siliconCarriers('intrinseco', 0, T).sigma, 1)} veces la del Si puro.`,
    },
    {
      level: 'chip',
      key: dopant + 'chip',
      text: 'Un transistor combina regiones N y P. Si el chip se calienta demasiado, los portadores térmicos se acercan a la concentración de dopaje y las uniones dejan de controlar bien la corriente: aumentan las fugas. Por eso importa la refrigeración.',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo 3 · Dopaje químico"
        icon={FlaskConical}
        title="Dopaje del silicio: tipo N y tipo P"
        description="El dopaje no es mezclar: es sustituir átomos de silicio de la red cristalina por impurezas controladas —en partes por millón o menos— para fijar cuántos portadores de carga hay y de qué tipo."
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Controles" icon={FlaskConical} className="xl:col-span-4 2xl:col-span-3">
          <div className="space-y-5">
            <Segmented<DopantId>
              label="Material"
              value={dopant}
              onChange={setDopant}
              columns={1}
              options={(Object.keys(DOPANTS) as DopantId[]).map((k) => ({ value: k, label: DOPANTS[k].label, color: DOPANTS[k].color }))}
            />
            <Slider
              label="Concentración de dopante"
              value={logN}
              min={DOPING_RANGE.minExp}
              max={DOPING_RANGE.maxExp}
              step={0.1}
              onChange={setLogN}
              display={dopant === 'intrinseco' ? '—' : `${fmtSci(N, 1)} cm⁻³`}
              hint={r.atomsPerDopant ? `≈ 1 átomo de ${d.symbol} por cada ${fmtSci(r.atomsPerDopant, 1)} átomos de Si` : 'Sin dopante'}
              color={d.color}
              minLabel="10¹³"
              maxLabel="10¹⁸ cm⁻³"
            />
            <Slider
              label="Temperatura"
              value={T}
              min={DOPING_T_RANGE_K.min}
              max={DOPING_T_RANGE_K.max}
              step={5}
              onChange={setT}
              display={`${T} K`}
              hint={`${fmt(toCelsius(T), 0)} °C`}
              color="#fb923c"
            />
            <button type="button" className="btn-ghost w-full" onClick={() => setT(clamp(Math.round(toKelvin(state.T) / 5) * 5, DOPING_T_RANGE_K.min, DOPING_T_RANGE_K.max))}>
              <Cpu size={16} aria-hidden /> Usar temperatura del chip ({fmt(state.T, 0)} °C)
            </button>
            {r.warnings.map((w) => (
              <p key={w} className="flex gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2 text-xs text-amber-200">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden /> {w}
              </p>
            ))}
          </div>
        </Card>

        <div className="space-y-6 xl:col-span-8 2xl:col-span-9">
          <DopingVisuals dopant={dopant} logN={logN} T={T} />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Electrones n" value={fmtSci(r.n)} unit="cm⁻³" color="#7fb2f0" kind="calculado" sub={r.majority === 'electrones' ? 'mayoritarios' : r.majority === 'huecos' ? 'minoritarios' : 'n = nᵢ'} />
            <Stat label="Huecos p" value={fmtSci(r.p)} unit="cm⁻³" color="#f0946b" kind="calculado" sub={r.majority === 'huecos' ? 'mayoritarios' : r.majority === 'electrones' ? 'minoritarios' : 'p = nᵢ'} />
            <Stat label="Conductividad σ" value={fmtSci(r.sigma, 2)} unit="S/cm" kind="calculado" sub={`ρ = ${fmtSci(r.rho, 2)} Ω·cm`} />
            <Stat label="E_F − E_i" value={`${r.fermiShift >= 0 ? '+' : ''}${fmt(r.fermiShift, 3)}`} unit="eV" kind="calculado" sub={r.fermiShift > 0.01 ? 'hacia la banda de conducción' : r.fermiShift < -0.01 ? 'hacia la banda de valencia' : 'en el centro'} />
          </div>
        </div>
      </div>

      <ChemistryExplainer layers={layers} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Portadores frente a temperatura" subtitle="Región extrínseca (plana) → región intrínseca (sube con T)" icon={LineIcon} actions={<DataTag kind="calculado" />}>
          <CarrierChart dopant={dopant} N={N} T={T} />
        </Card>
        <Card title="Conductividad: intrínseco vs. dopado" subtitle="Al calentar, σ del Si puro sube; la del dopado puede bajar (menor movilidad)" icon={Layers} actions={<DataTag kind="calculado" />}>
          <ConductivityChart dopant={dopant} N={N} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Equation name="Ley de acción de masas" refs={['streetman', 'sze']} vars={[{ sym: 'n, p', desc: 'Electrones y huecos libres', unit: 'cm⁻³' }]} validity="equilibrio térmico, semiconductor no degenerado.">
          n · p = nᵢ²
        </Equation>
        <Equation
          name="Neutralidad de carga (tipo N)"
          refs={['streetman', 'pierret']}
          vars={[
            { sym: 'N_D', desc: 'Concentración de donadores (P)', unit: 'cm⁻³' },
            { sym: 'N_A', desc: 'Concentración de aceptores (B)', unit: 'cm⁻³' },
          ]}
          validity="ionización completa (T ≳ 150 K para N ≤ 10¹⁷ cm⁻³) y N ≲ 10¹⁸ cm⁻³."
        >
          n = N<sub>D</sub>/2 + √((N<sub>D</sub>/2)² + nᵢ²)
        </Equation>
        <Equation
          name="Movilidad con dopaje (Caughey–Thomas)"
          refs={['caughey']}
          vars={[
            { sym: 'μmin, μmax', desc: 'Límites empíricos (e⁻: 92 y 1360; h⁺: 47,7 y 495)', unit: 'cm²/(V·s)' },
            { sym: 'N_ref, α', desc: 'Parámetros de ajuste del Si a 300 K' },
          ]}
          validity="Si a 300 K; el escalado con T usa (T/300)^−γ como aproximación educativa."
        >
          μ = μ<sub>min</sub> + (μ<sub>máx</sub> − μ<sub>min</sub>) / (1 + (N/N<sub>ref</sub>)<sup>α</sup>)
        </Equation>
      </div>

      <Card title="Para profundizar" icon={Grid3x3} accent="none">
        <div className="space-y-2">
          <Collapsible title="¿Por qué el dopaje no es simplemente «mezclar»?" defaultOpen>
            En una mezcla los componentes conservan su identidad y se distribuyen al azar. En el dopaje, cada átomo de P o B ocupa la posición de un átomo de Si dentro de la red
            cristalina (sustitución) y forma enlaces covalentes con sus cuatro vecinos. Se hace con técnicas como la implantación iónica o la difusión a alta temperatura, controlando la
            dosis con gran precisión: con 10¹⁶ cm⁻³ hay sólo un átomo dopante por cada 5 millones de átomos de silicio, y aun así la conductividad cambia en un factor de más de 10⁵{' '}
            <RefCite ids={['streetman', 'sze']} />.
          </Collapsible>
          <Collapsible title="Supuestos y rango de validez">
            <ul className="list-disc space-y-1 pl-5">
              <li>Ionización completa de dopantes: no se modela el «congelamiento» de portadores a baja temperatura (&lt; 150 K).</li>
              <li>Semiconductor no degenerado (N ≤ 10¹⁸ cm⁻³); a mayores concentraciones aparece una advertencia.</li>
              <li>nᵢ(T) con Varshni y Nc, Nv ∝ T^3/2; error típico menor que un factor 2.</li>
              <li>La red cristalina y el número de átomos dibujados son representaciones conceptuales, no a escala.</li>
            </ul>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}
