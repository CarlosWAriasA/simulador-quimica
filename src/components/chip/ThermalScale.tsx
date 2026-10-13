import { COLOR_SCALE_RANGE, temperatureGradientCss } from '../../utils/color';

const TICKS = [20, 60, 100];

/** Leyenda de la escala de color del mapa de calor. */
export function ThermalScale({ T }: { T?: number }) {
  const span = COLOR_SCALE_RANGE.max - COLOR_SCALE_RANGE.min;
  const at = (t: number) => Math.max(0, Math.min(1, (t - COLOR_SCALE_RANGE.min) / span)) * 100;
  return (
    <div className="w-full" aria-label="Escala de color de temperatura">
      <div className="relative h-2.5 rounded-full" style={{ background: temperatureGradientCss() }}>
        {T !== undefined && (
          <div className="absolute -top-1 h-[18px] w-1 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_2px_rgba(2,6,23,0.9)] transition-[left] duration-300" style={{ left: `${at(T)}%` }} />
        )}
      </div>
      <div className="relative mt-1 h-4 font-mono text-[11px] text-slate-400">
        {TICKS.map((t) => (
          <span key={t} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${at(t)}%` }}>
            {t} °C
          </span>
        ))}
      </div>
    </div>
  );
}
