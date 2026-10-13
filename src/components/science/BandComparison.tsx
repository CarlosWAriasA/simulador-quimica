import { motion, useReducedMotion } from 'framer-motion';
import { MATERIAL_LIST } from '../../data/materials';
import { bandgapVarshni, conceptualCarrierCount, intrinsicConcentration } from '../../science/semiconductor';
import type { MaterialId } from '../../types';
import { fmt, fmtSci } from '../../utils/format';

const W = 720;
const H = 420;
const PX_PER_EV = 150;
const VB_TOP = 300;

/**
 * Bandas de Si, Ge y GaAs lado a lado y a la MISMA escala de energía, a la
 * temperatura indicada. Los electrones dibujados son conceptuales (escala log de nᵢ).
 */
export function BandComparison({ T, selected, onSelect }: { T: number; selected?: MaterialId; onSelect?: (m: MaterialId) => void }) {
  const reduce = useReducedMotion();
  const colW = 200;
  const gap = (W - 3 * colW) / 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Comparación de bandas de energía de silicio, germanio y arseniuro de galio a la misma escala">
      {MATERIAL_LIST.map((m, idx) => {
        const x0 = gap + idx * (colW + gap);
        const eg = bandgapVarshni(m.id, T);
        const ni = intrinsicConcentration(m.id, T);
        const cbBottom = VB_TOP - eg * PX_PER_EV;
        const n = conceptualCarrierCount(ni, 12);
        const on = selected === m.id;
        return (
          <g key={m.id} onClick={onSelect ? () => onSelect(m.id) : undefined} style={{ cursor: onSelect ? 'pointer' : undefined }}>
            {on && <rect x={x0 - 10} y={8} width={colW + 20} height={H - 16} rx={16} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" />}
            <text x={x0 + colW / 2} y={40} textAnchor="middle" fontSize="30" fontWeight="700" fill="#fff" fontFamily="JetBrains Mono, monospace">
              {m.formula}
            </text>
            <circle cx={x0 + colW / 2 + (m.formula.length * 10 + 14)} cy={30} r={7} fill={m.color} />
            <rect x={x0} y={cbBottom - 52} width={colW} height={52} rx={8} fill="rgba(34,211,238,0.16)" stroke="#22d3ee" strokeOpacity={0.6} />
            <rect x={x0} y={VB_TOP} width={colW} height={52} rx={8} fill="rgba(167,139,250,0.22)" stroke="#a78bfa" strokeOpacity={0.6} />
            <line x1={x0 + colW / 2} x2={x0 + colW / 2} y1={cbBottom + 4} y2={VB_TOP - 4} stroke={m.color} strokeWidth={3} />
            <rect x={x0 + colW / 2 - 52} y={(cbBottom + VB_TOP) / 2 - 18} width={104} height={36} rx={8} fill="#070d1f" stroke={m.color} />
            <text x={x0 + colW / 2} y={(cbBottom + VB_TOP) / 2 + 8} textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff" fontFamily="JetBrains Mono, monospace">
              {fmt(eg, 2)} eV
            </text>
            {Array.from({ length: n }, (_, i) => {
              const ex = x0 + 14 + ((i * 0.618) % 1) * (colW - 28);
              const ey = cbBottom - 14 - ((i * 13) % 30);
              const dur = 4 + (i % 3);
              return (
                <motion.circle
                  key={i}
                  r={6}
                  fill="#22d3ee"
                  initial={{ cx: ex, cy: VB_TOP + 10, opacity: 0 }}
                  animate={reduce ? { cx: ex, cy: ey, opacity: 1 } : { cx: ex, cy: [VB_TOP + 10, ey, ey, VB_TOP + 10], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: dur, repeat: Infinity, delay: (i * 0.45) % 3, times: [0, 0.2, 0.8, 1] }}
                  style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}
                />
              );
            })}
            <text x={x0 + colW / 2} y={VB_TOP + 86} textAnchor="middle" fontSize="15" fill="#94a3b8">
              nᵢ ≈
            </text>
            <text x={x0 + colW / 2} y={VB_TOP + 110} textAnchor="middle" fontSize="20" fontWeight="600" fill="#e2e8f0" fontFamily="JetBrains Mono, monospace">
              {fmtSci(ni, 1)} cm⁻³
            </text>
          </g>
        );
      })}
    </svg>
  );
}
