import { motion } from 'framer-motion';
import type { Architecture } from '../../data/nanotech';

const GATE = '#c98500';
const OXIDE = '#7dd3fc';
const SI = '#3987e5';

/** Corte transversal esquemático de tres arquitecturas de transistor (CONCEPTUAL, no a escala). */
export function TransistorDiagram({ arch }: { arch: Architecture['id'] }) {
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full" role="img" aria-label={`Corte transversal esquemático de un transistor ${arch}`}>
      <rect x="20" y="170" width="280" height="40" rx="4" fill="#1e293b" stroke="#334155" />
      <text x="160" y="195" textAnchor="middle" fontSize="12" fill="#94a3b8">
        Sustrato de silicio
      </text>
      <motion.g key={arch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {arch === 'planar' && (
          <>
            <rect x="60" y="150" width="200" height="20" fill={SI} fillOpacity="0.55" />
            <text x="160" y="164" textAnchor="middle" fontSize="11" fill="#fff">
              canal (superficie)
            </text>
            <rect x="80" y="140" width="160" height="10" fill={OXIDE} fillOpacity="0.8" />
            <rect x="80" y="70" width="160" height="70" rx="4" fill={GATE} fillOpacity="0.85" />
            <text x="160" y="110" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1c1917">
              PUERTA
            </text>
          </>
        )}
        {arch === 'finfet' && (
          <>
            <path d="M 70 170 V 60 H 250 V 170 H 210 V 90 H 110 V 170 Z" fill={GATE} fillOpacity="0.85" />
            <rect x="120" y="70" width="80" height="10" fill={GATE} fillOpacity="0.85" />
            <path d="M 112 170 V 82 H 208 V 170 H 198 V 92 H 122 V 170 Z" fill={OXIDE} fillOpacity="0.8" />
            <rect x="122" y="92" width="76" height="78" fill={SI} fillOpacity="0.75" />
            <text x="160" y="135" textAnchor="middle" fontSize="11" fill="#fff">
              aleta Si
            </text>
            <text x="160" y="52" textAnchor="middle" fontSize="13" fontWeight="700" fill={GATE}>
              PUERTA (3 lados)
            </text>
          </>
        )}
        {arch === 'gaa' && (
          <>
            <rect x="70" y="40" width="180" height="130" rx="6" fill={GATE} fillOpacity="0.85" />
            {[58, 98, 138].map((y) => (
              <g key={y}>
                <rect x="96" y={y - 4} width="128" height="30" rx="6" fill={OXIDE} fillOpacity="0.85" />
                <rect x="102" y={y + 1} width="116" height="20" rx="4" fill={SI} fillOpacity="0.9" />
                <text x="160" y={y + 15} textAnchor="middle" fontSize="10" fill="#fff">
                  nanohoja Si
                </text>
              </g>
            ))}
            <text x="160" y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill={GATE}>
              PUERTA (rodea 4 lados)
            </text>
          </>
        )}
      </motion.g>
      <g transform="translate(20 12)" fontSize="10" fill="#cbd5e1">
        <rect width="10" height="10" fill={GATE} />
        <text x="14" y="9">
          puerta metálica
        </text>
        <rect x="100" width="10" height="10" fill={OXIDE} />
        <text x="114" y="9">
          dieléctrico
        </text>
        <rect x="185" width="10" height="10" fill={SI} />
        <text x="199" y="9">
          canal de Si
        </text>
      </g>
    </svg>
  );
}
