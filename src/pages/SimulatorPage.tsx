import { Activity, Gauge, LineChart as LineIcon, Scale, SlidersHorizontal, Thermometer } from 'lucide-react';
import { useMemo } from 'react';
import { ChipVisual } from '../components/chip/ChipVisual';
import { PowerChart } from '../components/charts/PowerChart';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { LiveIndicators } from '../components/sim/LiveIndicators';
import { SimClock } from '../components/sim/SimClock';
import { SimControls } from '../components/sim/SimControls';
import { Card } from '../components/ui/Card';
import { ChemistryExplainer } from '../components/ui/ChemistryExplainer';
import { Collapsible } from '../components/ui/Collapsible';
import { DataLegend, DataTag } from '../components/ui/DataTag';
import { Equation } from '../components/ui/Equation';
import { PageHeader } from '../components/ui/PageHeader';
import { RefCite } from '../components/ui/RefCite';
import { thermalExplanation } from '../content/thermalExplanations';
import { useSimulation } from '../context/SimulationContext';
import { MATERIAL_LIST, MATERIALS } from '../data/materials';
import { COOLING, DIE, HOTSPOT, POWER, THROTTLE } from '../data/thermalConfig';
import { dieCapacitance, dieResistance, steadyStateTemperature } from '../science/thermal';
import { fmt } from '../utils/format';

export function SimulatorPage() {
  const { state, params, derived } = useSimulation();
  const throttled = derived.power.factor < 0.999;
  const layers = thermalExplanation(params, state.T, derived.rate, derived.power.effective, throttled);

  const materialCompare = useMemo(
    () =>
      MATERIAL_LIST.map((m) => ({
        m,
        rDie: dieResistance(m.id),
        cDie: dieCapacitance(m.id),
        steady: steadyStateTemperature({ ...params, material: m.id }),
      })),
    [params],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo 1 · Simulación térmica"
        icon={Thermometer}
        title="Simulador térmico del chip"
        description="Modifica la carga, la refrigeración y el ambiente. El chip se calienta o se enfría de forma progresiva según el balance entre el calor generado y el disipado."
        actions={<SimClock />}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Controles" icon={SlidersHorizontal} className="xl:col-span-3">
          <SimControls />
        </Card>

        <section className="panel-strong relative flex flex-col items-center justify-center order-first overflow-hidden p-4 sm:p-6 xl:order-none xl:col-span-5 2xl:col-span-6" aria-label="Visualización del chip">
          <div className="circuit-bg absolute inset-0 opacity-60" aria-hidden />
          <div className="relative w-full max-w-[560px]">
            <ChipVisual
              T={state.T}
              ambient={params.ambientC}
              coreDelta={state.coreDelta}
              load={params.load}
              fanRps={COOLING[params.cooling].fanRps}
              running={state.running}
              materialLabel={MATERIALS[params.material].formula}
            />
          </div>
          <div className="relative mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <DataTag kind="conceptual" /> Distribución espacial del calor (ilustrativa). La temperatura media es un resultado calculado.
          </div>
        </section>

        <Card title="Indicadores en tiempo real" icon={Gauge} className="xl:col-span-4 2xl:col-span-3">
          <LiveIndicators />
        </Card>
      </div>

      <ChemistryExplainer layers={layers} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Evolución de la temperatura" subtitle="Resultado simulado frente al tiempo simulado" icon={LineIcon} className="lg:col-span-2">
          <TemperatureChart history={state.history} height={320} />
        </Card>
        <Card title="Potencia disipada" subtitle="Calor generado por el chip" icon={Activity}>
          <PowerChart history={state.history} height={320} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Modelo térmico" icon={Scale} accent="violet">
          <div className="space-y-4">
            <Equation
              name="Balance de energía (capacitancia concentrada)"
              refs={['incropera']}
              vars={[
                { sym: 'C', desc: 'Capacidad térmica efectiva', unit: 'J/K' },
                { sym: 'T', desc: 'Temperatura del chip', unit: '°C' },
                { sym: 'P', desc: 'Potencia disipada como calor', unit: 'W' },
                { sym: 'R', desc: 'Resistencia térmica chip → ambiente', unit: 'K/W' },
                { sym: 'T_amb', desc: 'Temperatura ambiente', unit: '°C' },
                { sym: 't', desc: 'Tiempo simulado', unit: 's' },
              ]}
              validity="un solo nodo térmico (temperatura uniforme del conjunto); no modela el retardo entre dado y disipador."
            >
              C · dT/dt = P − (T − T<sub>amb</sub>) / R
            </Equation>
            <Equation
              name="Potencia del chip"
              refs={['rabaey']}
              vars={[
                { sym: 'u', desc: 'Carga de trabajo (0–1)' },
                { sym: 'P_din', desc: 'Parte dinámica ∝ α·C·V²·f (conmutación)' },
              ]}
            >
              P = P<sub>reposo</sub> + (P<sub>máx</sub> − P<sub>reposo</sub>) · u
            </Equation>
            <p className="text-sm text-slate-300">
              Solución con P constante: T(t) = T∞ + (T₀ − T∞)·e<sup>−t/τ</sup>, con T∞ = T<sub>amb</sub> + P·R y τ = R·C. La app integra la ecuación con Runge–Kutta de 4.º orden en pasos
              de 0,05 s simulados. No se usan números aleatorios.
            </p>
          </div>
        </Card>

        <Card title="Parámetros utilizados" icon={SlidersHorizontal} accent="amber">
          <div className="mb-3">
            <DataLegend />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">Parámetro</th>
                  <th className="py-2 pr-3">Valor</th>
                  <th className="py-2">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Potencia en reposo', `${POWER.idleW} W`, 'supuesto'],
                  ['Potencia máxima (100 %)', `${POWER.maxW} W`, 'supuesto'],
                  [`R refrigeración (${COOLING[params.cooling].short})`, `${fmt(COOLING[params.cooling].rThermal, 2)} K/W`, 'supuesto'],
                  [`C efectiva (${COOLING[params.cooling].short})`, `${COOLING[params.cooling].capacitance} J/K`, 'supuesto'],
                  ['Dado: área × espesor', `${DIE.areaM2 * 1e6} mm² × ${DIE.thicknessM * 1e3} mm`, 'supuesto'],
                  [`Conductividad térmica ${MATERIALS[params.material].formula}`, `${MATERIALS[params.material].thermalConductivity.value} W/(m·K)`, 'publicado'],
                  ['R del dado = t/(k·A)', `${fmt(dieResistance(params.material), 4)} K/W`, 'calculado'],
                  ['Protección térmica', `desde ${THROTTLE.startC} °C, mín. ${THROTTLE.minFactor * 100} %`, 'supuesto'],
                  ['Puntos calientes', `${HOTSPOT.kKPerW} K/W por núcleo, τ = ${HOTSPOT.tauS} s`, 'conceptual'],
                ].map(([a, b, k]) => (
                  <tr key={a}>
                    <td className="py-2 pr-3 text-slate-300">{a}</td>
                    <td className="num py-2 pr-3 text-white">{b}</td>
                    <td className="py-2">
                      <DataTag kind={k as 'supuesto'} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="¿Cuánto influye el material en la temperatura?" subtitle="Mismo diseño hipotético, misma potencia y refrigeración: sólo cambia el semiconductor del dado" icon={Scale}>
        <div className="grid gap-4 md:grid-cols-3">
          {materialCompare.map(({ m, rDie, cDie, steady }) => (
            <div key={m.id} className={`rounded-xl border p-4 ${m.id === params.material ? 'border-white/25 bg-white/[0.05]' : 'border-white/[0.07]'}`}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: m.color }} aria-hidden />
                <span className="font-semibold text-white">
                  {m.name} ({m.formula})
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">k térmica</dt>
                  <dd className="num">{m.thermalConductivity.value} W/(m·K)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">R del dado</dt>
                  <dd className="num">{fmt(rDie, 3)} K/W</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">C del dado</dt>
                  <dd className="num">{fmt(cDie, 3)} J/K</dd>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1">
                  <dt className="text-slate-300">Equilibrio T∞</dt>
                  <dd className="num font-semibold text-white">{fmt(steady, 1)} °C</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Collapsible title="Suposiciones de esta comparación" defaultOpen>
            Se supone el mismo dado (150 mm² × 0,5 mm), la misma potencia y el mismo sistema de refrigeración. En la realidad un chip de Ge o GaAs tendría otro diseño, otra tensión y
            otra potencia, por lo que <strong>no puede atribuirse la diferencia de temperatura sólo al material</strong>. Aquí se ve que la conducción a través del dado (R ≈ 0,02–0,06 K/W)
            es pequeña frente a la resistencia de la refrigeración (0,22–1,2 K/W): la temperatura depende sobre todo de la potencia, el encapsulado y la refrigeración{' '}
            <RefCite ids={['incropera', 'pop', 'glassbrenner']} />.
          </Collapsible>
          <Collapsible title="Limitaciones del modelo">
            <ul className="list-disc space-y-1 pl-5">
              <li>Modelo de un nodo: no distingue entre la temperatura del dado y la del disipador.</li>
              <li>La potencia de fuga real aumenta con la temperatura; aquí se considera constante dentro de P_reposo.</li>
              <li>La distribución espacial (puntos calientes) es conceptual, no proviene de una simulación por elementos finitos.</li>
              <li>Los parámetros no corresponden a ningún procesador comercial concreto.</li>
            </ul>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}
