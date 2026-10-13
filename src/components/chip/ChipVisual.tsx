import { motion, useReducedMotion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { coreActivities } from '../../science/thermal';
import { temperatureColor } from '../../utils/color';
import { fmt } from '../../utils/format';
import { CORE_LAYOUT, HeatmapCanvas } from './HeatmapCanvas';

interface ChipVisualProps {
  T: number;
  ambient: number;
  coreDelta: number[];
  load: number;
  fanRps: number;
  running: boolean;
  materialLabel?: string;
  className?: string;
  showCoreLabels?: boolean;
}

const VB = 400;
const DIE0 = 104;
const DIE = 192;

/** Pistas del sustrato: del borde del dado a los contactos (un lado; se rota). */
function sideTraces(): string[] {
  const out: string[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const xs = DIE0 + 14 + (i * (DIE - 28)) / (n - 1);
    const xp = 74 + (i * (VB - 148)) / (n - 1);
    out.push(`M ${xs.toFixed(1)} ${DIE0} L ${xs.toFixed(1)} ${DIE0 - 12} L ${xp.toFixed(1)} 74 L ${xp.toFixed(1)} 56`);
  }
  return out;
}

const TRACES = sideTraces();
const PADS = Array.from({ length: 13 }, (_, i) => 64 + i * 22.67);

function ChipVisualImpl({ T, ambient, coreDelta, load, fanRps, running, materialLabel = 'Si', className = '', showCoreLabels = true }: ChipVisualProps) {
  const reduce = useReducedMotion();
  const glow = temperatureColor(T);
  const heat = Math.max(0, Math.min(1, (T - 40) / 60));
  const activity = useMemo(() => coreActivities(load), [load]);
  const pulseDur = 3.2 - 2.4 * load;
  const animate = running && !reduce;

  return (
    <div className={`relative aspect-square w-full select-none ${className}`} role="img" aria-label={`Chip virtual a ${fmt(T, 1)} grados Celsius con carga del ${Math.round(load * 100)} por ciento`}>
      {/* Halo térmico */}
      <div
        className="absolute inset-[6%] rounded-[18%] blur-3xl transition-[background-color,opacity] duration-700"
        style={{ backgroundColor: glow, opacity: 0.18 + heat * 0.45 }}
        aria-hidden
      />

      {/* Ondas de calor que salen del dado */}
      {animate &&
        heat > 0.05 &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            aria-hidden
            className="absolute rounded-[12%] border-2"
            style={{ left: `${(DIE0 / VB) * 100}%`, top: `${(DIE0 / VB) * 100}%`, width: `${(DIE / VB) * 100}%`, height: `${(DIE / VB) * 100}%`, borderColor: glow }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.65], opacity: [0.5 * heat + 0.1, 0] }}
            transition={{ duration: 3.2 - heat * 1.2, repeat: Infinity, delay: i * 1.05, ease: 'easeOut' }}
          />
        ))}

      {/* Capa base: sustrato, contactos y pistas */}
      <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="substrate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#13234a" />
            <stop offset="1" stopColor="#0a1430" />
          </linearGradient>
          <linearGradient id="pad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect x="36" y="36" width="328" height="328" rx="22" fill="url(#substrate)" stroke="rgba(125,211,252,0.25)" strokeWidth="1.5" />
        <rect x="46" y="46" width="308" height="308" rx="16" fill="none" stroke="rgba(125,211,252,0.08)" strokeWidth="1" />
        {[0, 90, 180, 270].map((rot) => (
          <g key={rot} transform={`rotate(${rot} 200 200)`}>
            {PADS.map((x) => (
              <rect key={x} x={x - 4} y={40} width={8} height={10} rx={1.5} fill="url(#pad)" opacity={0.85} />
            ))}
            {TRACES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="1.6" strokeLinejoin="round" />
            ))}
            {animate &&
              TRACES.map((d, i) => (
                <path
                  key={`p${i}`}
                  d={d}
                  fill="none"
                  stroke={glow}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="5 70"
                  className="trace-pulse"
                  style={{ animationDuration: `${pulseDur + (i % 3) * 0.35}s`, animationDelay: `${(i * 0.37) % 1.5}s`, opacity: 0.25 + load * 0.75 }}
                />
              ))}
          </g>
        ))}
        {/* Marco del dado */}
        <rect x={DIE0 - 8} y={DIE0 - 8} width={DIE + 16} height={DIE + 16} rx="12" fill="#050a18" stroke={glow} strokeOpacity={0.55} strokeWidth="2" style={{ transition: 'stroke 0.6s' }} />
        <text x="58" y="350" fill="rgba(148,163,184,0.7)" fontSize="11" fontFamily="JetBrains Mono, monospace">
          TC-8 · {materialLabel}
        </text>
      </svg>

      {/* Mapa de calor del dado */}
      <div className="absolute" style={{ left: `${(DIE0 / VB) * 100}%`, top: `${(DIE0 / VB) * 100}%`, width: `${(DIE / VB) * 100}%`, height: `${(DIE / VB) * 100}%` }}>
        <HeatmapCanvas T={T} ambient={ambient} coreDelta={coreDelta} />
      </div>

      {/* Capa superior: núcleos, caché y lectura central */}
      <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform={`translate(${DIE0} ${DIE0}) scale(${DIE})`}>
          <rect x="0.04" y="0.42" width="0.92" height="0.16" rx="0.02" fill="rgba(2,6,23,0.55)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.004" />
          {CORE_LAYOUT.map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="0.02" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.005" />
              {/* Microcircuitos internos */}
              <path
                d={`M ${c.x + 0.03} ${c.y + 0.08} h ${c.w - 0.06} M ${c.x + 0.03} ${c.y + 0.16} h ${c.w - 0.1} M ${c.x + 0.03} ${c.y + 0.24} h ${c.w - 0.08}`}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="0.004"
              />
              <rect x={c.x + 0.025} y={c.y + c.h - 0.045} width={c.w - 0.05} height="0.018" rx="0.009" fill="rgba(2,6,23,0.6)" />
              <rect x={c.x + 0.025} y={c.y + c.h - 0.045} width={(c.w - 0.05) * activity[i]} height="0.018" rx="0.009" fill="#f8fafc" opacity={0.9} style={{ transition: 'width 0.4s' }} />
              {showCoreLabels && (
                <text x={c.x + 0.025} y={c.y + 0.05} fontSize="0.042" fill="rgba(255,255,255,0.85)" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                  N{i + 1}
                </text>
              )}
            </g>
          ))}
          <text x="0.5" y="0.525" textAnchor="middle" fontSize="0.085" fontWeight="700" fill="#fff" fontFamily="JetBrains Mono, monospace" style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.8)', strokeWidth: 0.012 }}>
            {fmt(T, 1)} °C
          </text>
        </g>
        {/* Ventilador (indicador del sistema de refrigeración) */}
        <g transform="translate(338 338)">
          <circle r="20" fill="#071026" stroke="rgba(125,211,252,0.35)" />
          <g className={animate && fanRps > 0 ? 'fan-spin' : ''} style={{ animationDuration: fanRps > 0 ? `${1 / fanRps}s` : undefined }}>
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} d="M0 0 C 4 -6, 10 -12, 3 -16 C -2 -12, -3 -6, 0 0" fill={fanRps > 0 ? '#67e8f9' : '#475569'} transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r="3.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

export const ChipVisual = memo(ChipVisualImpl);
