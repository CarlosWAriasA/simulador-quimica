import { Fan, Gamepad2, Moon, Snowflake, Wind, Zap, Monitor, ShieldCheck } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { MATERIAL_LIST } from '../../data/materials';
import { AMBIENT_RANGE, COOLING_LIST, WORKLOADS, type WorkloadPreset } from '../../data/thermalConfig';
import type { CoolingId, MaterialId } from '../../types';
import { fmt } from '../../utils/format';
import { InfoTip } from '../ui/InfoTip';
import { Segmented } from '../ui/Segmented';
import { Slider } from '../ui/Slider';

const WORKLOAD_ICON: Record<WorkloadPreset['id'], typeof Moon> = { reposo: Moon, normal: Monitor, videojuegos: Gamepad2, intensiva: Zap };
const COOLING_ICON: Record<CoolingId, typeof Fan> = { pasiva: Wind, ventilador: Fan, avanzada: Snowflake };

/** Panel izquierdo: controles de la simulación térmica. */
export function SimControls({ large = false, showAdvanced = true }: { large?: boolean; showAdvanced?: boolean }) {
  const { params, actions } = useSimulation();
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="text-sm font-medium text-slate-300">Modo de simulación</div>
        <div className="grid grid-cols-2 gap-1.5">
          {WORKLOADS.map((w) => {
            const Icon = WORKLOAD_ICON[w.id];
            const active = params.workload === w.id;
            return (
              <button
                key={w.id}
                type="button"
                aria-pressed={active}
                onClick={() => actions.setWorkload(w.id)}
                title={w.description}
                className={`flex items-center gap-2 rounded-xl border px-3 text-left font-semibold transition-colors ${large ? 'py-3 text-base' : 'py-2 text-sm'} ${
                  active ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-white/[0.07] bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={16} aria-hidden className="shrink-0" />
                <span className="min-w-0">
                  <span className="block leading-tight">{w.label}</span>
                  <span className="num block text-[11px] font-medium text-slate-400">{Math.round(w.load * 100)} %</span>
                </span>
              </button>
            );
          })}
        </div>
        {params.workload === 'personalizado' && <p className="text-xs text-amber-300/90">Modo personalizado: carga ajustada manualmente.</p>}
      </div>

      <Slider
        label="Carga del procesador"
        value={Math.round(params.load * 100)}
        min={0}
        max={100}
        onChange={(v) => actions.setLoad(v / 100)}
        display={`${Math.round(params.load * 100)} %`}
        color="#f97316"
        minLabel="0 %"
        maxLabel="100 %"
        large={large}
        ariaValueText={`${Math.round(params.load * 100)} por ciento`}
      />

      <Slider
        label="Temperatura ambiente"
        value={params.ambientC}
        min={AMBIENT_RANGE.min}
        max={AMBIENT_RANGE.max}
        onChange={actions.setAmbient}
        display={`${fmt(params.ambientC, 0)} °C`}
        color="#38bdf8"
        minLabel={`${AMBIENT_RANGE.min} °C`}
        maxLabel={`${AMBIENT_RANGE.max} °C`}
        large={large}
      />

      <Segmented<CoolingId>
        label={
          <span className="flex items-center gap-1">
            Refrigeración
            <InfoTip>La refrigeración cambia la resistencia térmica R: cuanto menor es R, más fácil es evacuar el calor hacia el ambiente.</InfoTip>
          </span>
        }
        value={params.cooling}
        onChange={actions.setCooling}
        size={large ? 'lg' : 'md'}
        columns={1}
        options={COOLING_LIST.map((c) => ({ value: c.id, label: c.label, icon: COOLING_ICON[c.id], hint: c.description }))}
      />

      <Segmented<MaterialId>
        label={
          <span className="flex items-center gap-1">
            Material semiconductor
            <InfoTip>
              Se compara un diseño hipotético idéntico fabricado con cada material. El material cambia la conducción de calor a través del dado y las propiedades electrónicas
              (Eg, nᵢ), pero la temperatura depende sobre todo de la potencia y la refrigeración.
            </InfoTip>
          </span>
        }
        value={params.material}
        onChange={actions.setMaterial}
        size={large ? 'lg' : 'md'}
        options={MATERIAL_LIST.map((m) => ({ value: m.id, label: m.formula, hint: m.name, color: m.color }))}
      />

      {showAdvanced && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-cyan-400" checked={params.throttling} onChange={(e) => actions.setThrottling(e.target.checked)} />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
              <ShieldCheck size={15} className="text-emerald-300" aria-hidden /> Protección térmica
            </span>
            <span className="block text-xs text-slate-400">Sobre 95 °C el chip reduce su frecuencia y potencia, como hacen los procesadores reales.</span>
          </span>
        </label>
      )}
    </div>
  );
}
