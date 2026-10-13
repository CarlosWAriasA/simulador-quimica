import { BookMarked, GraduationCap } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { DataLegend, DataTag } from '../components/ui/DataTag';
import { PageHeader } from '../components/ui/PageHeader';
import { RefCite } from '../components/ui/RefCite';
import { PROJECT } from '../data/project';
import { REFERENCES } from '../data/references';
import { COOLING_LIST, WORKLOADS } from '../data/thermalConfig';
import { steadyStateTemperature, timeConstant } from '../science/thermal';
import { fmt } from '../utils/format';

function Section({ n, title, children, id }: { n: number; title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="panel scroll-mt-24 p-5 sm:p-6">
      <h2 className="flex items-baseline gap-3 text-xl font-semibold">
        <span className="num text-sm text-cyan-300">{String(n).padStart(2, '0')}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export function AboutPage() {
  const table = useMemo(
    () =>
      WORKLOADS.map((w) => ({
        w,
        temps: COOLING_LIST.map((c) => steadyStateTemperature({ load: w.load, ambientC: 25, cooling: c.id, material: 'si', throttling: true })),
      })),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${PROJECT.course} · ${PROJECT.university}`} icon={GraduationCap} title="Sobre el proyecto" description={PROJECT.program} />

      <div className="panel-strong p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Título académico</div>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{PROJECT.title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prototipo</div>
            <div className="text-lg font-semibold text-white">{PROJECT.prototype} — simulador interactivo de semiconductores y temperatura</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Equipo</div>
            <div className="text-slate-200">{PROJECT.team.length ? PROJECT.team.join(', ') : 'Estudiantes de Ingeniería en TIC, UNIBE'}</div>
            {PROJECT.professor && <div className="text-sm text-slate-400">Docente: {PROJECT.professor}</div>}
          </div>
        </div>
      </div>

      <Section n={1} title="Introducción">
        <p>
          Todos los dispositivos de las TIC —teléfonos, computadoras, servidores, paneles solares— dependen de materiales semiconductores. Sus propiedades eléctricas nacen de la química: del
          tipo de enlace, de la estructura cristalina y de la energía necesaria para liberar electrones (banda prohibida) <RefCite ids={['chang', 'sze']} />. Al miniaturizar los transistores a
          escala nanométrica, se integran miles de millones de ellos en un chip, y el calor que generan se convierte en uno de los principales límites tecnológicos <RefCite ids={['pop']} />.
        </p>
      </Section>

      <Section n={2} title="Planteamiento del problema">
        <p>
          Un procesador transforma casi toda la energía eléctrica que recibe en calor. Si la temperatura sube demasiado, aumentan las corrientes de fuga, se reduce el rendimiento y se
          acelera el envejecimiento del dispositivo. ¿Cómo influyen la carga de trabajo, la refrigeración y el material semiconductor en la temperatura de un chip, y qué ocurre a nivel
          químico dentro del material cuando se calienta?
        </p>
      </Section>

      <Section n={3} title="Objetivos">
        <p>
          <strong className="text-white">Objetivo general:</strong> {PROJECT.generalObjective}
        </p>
        <p className="font-semibold text-white">Objetivos específicos:</p>
        <ol className="list-decimal space-y-1 pl-6">
          {PROJECT.specificObjectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
      </Section>

      <Section n={4} title="Fundamentos químicos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Enlace covalente y estructura cristalina:</strong> Si y Ge (grupo 14) forman 4 enlaces sp³ en una red tipo diamante; el GaAs (III–V) adopta la
            estructura de blenda de zinc con enlace parcialmente iónico <RefCite ids={['kittel', 'chang']} />.
          </li>
          <li>
            <strong className="text-white">Teoría de bandas:</strong> los electrones de enlace ocupan la banda de valencia; para conducir deben superar la banda prohibida Eg (Si 1,12 eV;
            Ge 0,66 eV; GaAs 1,42 eV a 300 K), que disminuye con la temperatura según la ecuación de Varshni <RefCite ids={['varshni', 'ioffe']} />.
          </li>
          <li>
            <strong className="text-white">Excitación térmica:</strong> la concentración de portadores intrínsecos crece exponencialmente con T: nᵢ ∝ T^3/2·exp(−Eg/2kT){' '}
            <RefCite ids={['sze']} />.
          </li>
          <li>
            <strong className="text-white">Dopaje:</strong> sustituir Si por P (5 e⁻ de valencia) aporta electrones (tipo N); por B (3 e⁻) crea huecos (tipo P). Se cumple n·p = nᵢ²{' '}
            <RefCite ids={['streetman']} />.
          </li>
          <li>
            <strong className="text-white">Nanomateriales:</strong> por debajo de ~10 nm aparecen efectos de superficie y de confinamiento cuántico (p. ej., puntos cuánticos de CdSe){' '}
            <RefCite ids={['brus', 'yu']} />. Las perovskitas ABX₃ ofrecen bandas prohibidas ajustables para celdas solares <RefCite ids={['green', 'kojima']} />.
          </li>
        </ul>
      </Section>

      <Section n={5} title="Metodología">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Revisión bibliográfica de propiedades de Si, Ge, GaAs y perovskitas en fuentes académicas (Sze & Ng, Ioffe, artículos revisados por pares).</li>
          <li>Selección de modelos documentados: balance de energía de capacitancia concentrada, ecuación de Varshni, concentración intrínseca, neutralidad de carga, Caughey–Thomas, Brus y Arrhenius.</li>
          <li>Definición de un chip hipotético con parámetros supuestos (P, R, C) de orden de magnitud realista, centralizados y documentados en el código.</li>
          <li>Implementación como aplicación web (React + TypeScript) con integración numérica Runge–Kutta de 4.º orden y sin datos aleatorios.</li>
          <li>Verificación con pruebas unitarias: solución analítica, valores publicados a 300 K, neutralidad de carga y casos límite.</li>
          <li>Diseño de escenarios demostrativos (reposo, carga intensiva, refrigeración, materiales y dopaje) para la exposición.</li>
        </ol>
        <DataLegend />
      </Section>

      <Section n={6} title="Descripción del prototipo">
        <p>
          ThermoChip Lab es un laboratorio virtual que se ejecuta en el navegador. Incluye un chip de 8 núcleos con mapa de calor, controles de carga, temperatura ambiente, refrigeración y
          material; indicadores en tiempo real; gráficas sincronizadas; un diagrama de bandas animado; un módulo de dopaje con red cristalina; un comparador de materiales; un módulo de
          nanomateriales; una calculadora de energía y un modo presentación. Los resultados pueden exportarse en CSV o imprimirse.
        </p>
      </Section>

      <Section n={7} title="Resultados simulados">
        <p>
          Temperatura de equilibrio calculada del chip hipotético de silicio (ambiente 25 °C, protección térmica activada). <DataTag kind="calculado" />
        </p>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="py-2 pr-3">Modo (carga)</th>
                {COOLING_LIST.map((c) => (
                  <th key={c.id} className="py-2 pr-3">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num divide-y divide-white/5">
              {table.map(({ w, temps }) => (
                <tr key={w.id}>
                  <td className="py-2 pr-3 font-sans text-slate-200">
                    {w.label} ({Math.round(w.load * 100)} %)
                  </td>
                  {temps.map((t, i) => (
                    <td key={i} className={`py-2 pr-3 ${t > 95 ? 'text-red-300' : 'text-white'}`}>
                      {fmt(t, 1)} °C
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-1 pl-5">
          <li>Con carga intensiva y sin refrigeración activa, el modelo alcanza el límite y la protección térmica reduce la potencia.</li>
          <li>
            Constantes de tiempo τ = R·C: {COOLING_LIST.map((c) => `${c.short} ${fmt(timeConstant(c.id, 'si'), 0)} s`).join(' · ')}: el calentamiento es progresivo, no instantáneo.
          </li>
          <li>Cambiar Si por Ge o GaAs con el mismo diseño altera el equilibrio sólo unos pocos °C: domina la refrigeración.</li>
          <li>A 100 °C la concentración intrínseca calculada del Si es unas 150 veces mayor que a 25 °C; en Ge, el aumento parte de un valor ~2000 veces mayor que el del Si.</li>
        </ul>
        <p className="text-sm text-amber-200/80">Estos valores son resultados de un modelo con parámetros supuestos, no mediciones experimentales.</p>
      </Section>

      <Section n={8} title="Limitaciones">
        <ul className="list-disc space-y-1 pl-5">
          <li>Modelo térmico de un nodo; un chip real tiene varias capas (dado, encapsulado, disipador) con distintas constantes de tiempo.</li>
          <li>Potencia lineal con la carga y sin dependencia de la temperatura de las fugas.</li>
          <li>Modelos de portadores válidos sólo en rango no degenerado y con ionización completa (250–600 K).</li>
          <li>Visualizaciones de electrones, redes cristalinas y mapas de calor son conceptuales.</li>
          <li>No se fabricó ni midió ningún dispositivo físico.</li>
        </ul>
      </Section>

      <Section n={9} title="Evaluación económica y ambiental">
        <p>
          Un prototipo físico equivalente costaría del orden de 110–415 USD (estimación), generaría residuos electrónicos y requeriría manipular materiales como GaAs (con arsénico). La
          simulación digital tiene costo prácticamente nulo, es reproducible y permite explorar escenarios peligrosos o costosos. En 2022 se generaron 62 Mt de residuos electrónicos y sólo
          el 22,3 % se recicló de forma documentada <RefCite ids={['gem2024']} />. Ver detalles en{' '}
          <a href="#/resultados" className="text-cyan-300 hover:underline">
            Resultados y sostenibilidad
          </a>
          .
        </p>
      </Section>

      <Section n={10} title="Conclusiones">
        <ul className="list-disc space-y-2 pl-5">
          <li>La temperatura de un chip resulta del balance entre la potencia disipada y la capacidad de evacuar calor; la refrigeración y la carga dominan sobre el material.</li>
          <li>La química del semiconductor determina cómo responde a la temperatura: una banda prohibida menor (Ge) implica muchos más portadores térmicos y más fugas.</li>
          <li>El dopaje controlado transforma al silicio en un material tipo N o P con conductividad ajustable en varios órdenes de magnitud, base de todo transistor.</li>
          <li>Los nanomateriales y las arquitecturas nanométricas (FinFET, GAA, puntos cuánticos, perovskitas) son el puente entre la química de materiales y la innovación en TIC.</li>
          <li>La gestión térmica eficiente es una cuestión técnica, económica y ambiental.</li>
        </ul>
      </Section>

      <section id="referencias" className="panel scroll-mt-24 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <BookMarked size={20} className="text-cyan-300" aria-hidden /> Referencias bibliográficas
        </h2>
        <ol className="mt-4 space-y-3 text-sm">
          {REFERENCES.map((r, i) => (
            <li key={r.id} className="flex gap-3">
              <span className="num w-7 shrink-0 text-right font-semibold text-cyan-300">[{i + 1}]</span>
              <div>
                <p className="text-slate-200">
                  {r.apa}{' '}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer noopener" className="break-all text-cyan-300 hover:underline">
                      {r.url}
                    </a>
                  )}
                </p>
                <p className="text-xs text-slate-500">Uso en la app: {r.usedFor}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
