import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import { fmt } from '../../utils/format';

interface BandDiagramProps {
  /** Banda prohibida [eV]. */
  eg: number;
  /** Energía térmica k·T [eV]. */
  kT: number;
  /** Número de pares electrón-hueco a dibujar (conceptual). */
  excited: number;
  color: string;
  label?: string;
  /** Desplazamiento del nivel de Fermi respecto al intrínseco [eV] (opcional). */
  fermiShift?: number;
  /** Electrones/huecos extra aportados por dopaje (conceptual). */
  donorElectrons?: number;
  acceptorHoles?: number;
  height?: number;
}

const W = 560;
const PX_PER_EV = 120;
const golden = (i: number) => (i * 0.6180339887) % 1;

function BandDiagramImpl({ eg, kT, excited, color, label, fermiShift, donorElectrons = 0, acceptorHoles = 0, height = 340 }: BandDiagramProps) {
  const reduce = useReducedMotion();
  const H = height;
  const vbTop = H - 80;
  const gapPx = eg * PX_PER_EV;
  const cbBottom = vbTop - gapPx;
  const cbTop = Math.max(14, cbBottom - 62);
  const midY = (vbTop + cbBottom) / 2;
  const x0 = 70;
  const x1 = W - 116;
  const span = x1 - x0 - 20;
  const fermiY = fermiShift !== undefined ? midY - fermiShift * PX_PER_EV : null;
  const donorY = cbBottom + 0.045 * PX_PER_EV;
  const acceptorY = vbTop - 0.045 * PX_PER_EV;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Diagrama de bandas${label ? ' de ' + label : ''}: banda prohibida de ${fmt(eg, 2)} electronvoltios`}>
      <defs>
        <linearGradient id="cb-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.05" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="vb-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0.08" />
        </linearGradient>
        <pattern id="gap-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Eje de energía */}
      <line x1={36} y1={H - 20} x2={36} y2={12} stroke="#64748b" strokeWidth="1.5" />
      <path d={`M 31 20 L 36 10 L 41 20`} fill="none" stroke="#64748b" strokeWidth="1.5" />
      <text x={22} y={H / 2} fill="#94a3b8" fontSize="13" transform={`rotate(-90 22 ${H / 2})`} textAnchor="middle">
        Energía del electrón
      </text>

      {/* Banda de conducción */}
      <motion.rect x={x0} width={x1 - x0} rx="8" fill="url(#cb-grad)" stroke="#22d3ee" strokeOpacity="0.6" initial={false} animate={{ y: cbTop, height: cbBottom - cbTop }} transition={{ duration: 0.5 }} />
      <motion.text x={x0 + 10} fill="#67e8f9" fontSize="14" fontWeight="600" initial={false} animate={{ y: cbTop + 20 }}>
        Banda de conducción
      </motion.text>

      {/* Banda prohibida */}
      <motion.rect x={x0} width={x1 - x0} fill="url(#gap-hatch)" initial={false} animate={{ y: cbBottom, height: gapPx }} transition={{ duration: 0.5 }} />
      <g>
        <line x1={x1 + 22} x2={x1 + 22} y1={cbBottom} y2={vbTop} stroke={color} strokeWidth="2" />
        <line x1={x1 + 14} x2={x1 + 30} y1={cbBottom} y2={cbBottom} stroke={color} strokeWidth="2" />
        <line x1={x1 + 14} x2={x1 + 30} y1={vbTop} y2={vbTop} stroke={color} strokeWidth="2" />
        <text x={x1 + 36} y={midY - 4} fill="#fff" fontSize="15" fontWeight="700">
          Eg
        </text>
        <text x={x1 + 36} y={midY + 14} fill="#cbd5e1" fontSize="13" fontFamily="JetBrains Mono, monospace">
          {fmt(eg, 3)} eV
        </text>
      </g>
      <text x={(x0 + x1) / 2} y={midY + 5} fill="#64748b" fontSize="13" textAnchor="middle" fontStyle="italic">
        banda prohibida: no hay estados permitidos
      </text>

      {/* Escala k·T */}
      <g>
        <rect x={x0 - 26} y={vbTop - kT * PX_PER_EV} width={10} height={Math.max(1.5, kT * PX_PER_EV)} fill="#fb923c" />
        <text x={x0 - 21} y={vbTop + 16} fill="#fdba74" fontSize="11" textAnchor="middle">
          kT
        </text>
      </g>

      {/* Banda de valencia */}
      <rect x={x0} y={vbTop} width={x1 - x0} height={56} rx="8" fill="url(#vb-grad)" stroke="#a78bfa" strokeOpacity="0.6" />
      <text x={x0 + 10} y={vbTop + 48} fill="#c4b5fd" fontSize="14" fontWeight="600">
        Banda de valencia (enlaces covalentes)
      </text>
      {Array.from({ length: 34 }, (_, i) => (
        <circle key={i} cx={x0 + 14 + (i % 17) * ((x1 - x0 - 28) / 16)} cy={vbTop + 10 + Math.floor(i / 17) * 12} r="3.2" fill="#a5b4fc" opacity="0.55" />
      ))}

      {/* Niveles de dopantes */}
      {donorElectrons > 0 && (
        <g>
          <line x1={x0 + 10} x2={x1 - 10} y1={donorY} y2={donorY} stroke="#22d3ee" strokeDasharray="4 5" strokeOpacity="0.7" />
          <text x={x1 - 12} y={donorY + 14} fill="#67e8f9" fontSize="11" textAnchor="end">
            nivel donador (P), ≈ 45 meV bajo E_C
          </text>
        </g>
      )}
      {acceptorHoles > 0 && (
        <g>
          <line x1={x0 + 10} x2={x1 - 10} y1={acceptorY} y2={acceptorY} stroke="#fb923c" strokeDasharray="4 5" strokeOpacity="0.7" />
          <text x={x1 - 12} y={acceptorY - 6} fill="#fdba74" fontSize="11" textAnchor="end">
            nivel aceptor (B), ≈ 45 meV sobre E_V
          </text>
        </g>
      )}

      {fermiY !== null && (
        <motion.g initial={false} animate={{ y: fermiY }} transition={{ duration: 0.5 }}>
          <line x1={x0} x2={x1} y1={0} y2={0} stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="10 6" />
          <text x={x0 + 6} y={-6} fill="#f8fafc" fontSize="12" fontWeight="600">
            E_F (nivel de Fermi)
          </text>
        </motion.g>
      )}

      {/* Pares electrón-hueco generados térmicamente */}
      {Array.from({ length: excited }, (_, i) => {
        const x = x0 + 20 + golden(i + 1) * span;
        const dur = 5.5 + (i % 4) * 0.7;
        const delay = (i * 0.83) % 4;
        const yCb = cbBottom - 14 - ((i * 7) % 30);
        const yVb = vbTop + 6;
        return (
          <g key={`ex-${i}`}>
            <motion.circle
              r="7"
              fill="none"
              stroke="#fb923c"
              strokeWidth="2"
              cy={yVb}
              initial={{ cx: x, opacity: 0 }}
              animate={reduce ? { cx: x, opacity: 1 } : { opacity: [0, 0, 1, 1, 0], cx: [x, x, x, x - 18, x] }}
              transition={{ duration: dur, repeat: Infinity, delay, times: [0, 0.12, 0.22, 0.8, 0.92] }}
            />
            <motion.circle
              r="6"
              fill="#22d3ee"
              initial={{ cx: x, cy: yVb, opacity: 0 }}
              animate={reduce ? { cx: x, cy: yCb, opacity: 1 } : { cy: [yVb, yVb, yCb, yCb, yVb], cx: [x, x, x, x + 26, x], opacity: [0, 1, 1, 1, 0.3] }}
              transition={{ duration: dur, repeat: Infinity, delay, times: [0, 0.12, 0.22, 0.8, 0.92], ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
            />
          </g>
        );
      })}

      {/* Electrones aportados por donadores (tipo N) */}
      {Array.from({ length: donorElectrons }, (_, i) => {
        const x = x0 + 30 + golden(i + 11) * span;
        const y = cbBottom - 10 - ((i * 11) % 34);
        return (
          <motion.circle
            key={`d-${i}`}
            r="6"
            fill="#22d3ee"
            cy={y}
            initial={{ cx: x, opacity: 0 }}
            animate={reduce ? { cx: x, opacity: 1 } : { cx: [x, x + 40, x], opacity: 1 }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
      {/* Huecos aportados por aceptores (tipo P) */}
      {Array.from({ length: acceptorHoles }, (_, i) => {
        const x = x0 + 30 + golden(i + 23) * span;
        return (
          <motion.circle
            key={`a-${i}`}
            r="7"
            fill="#0b1220"
            stroke="#fb923c"
            strokeWidth="2"
            cy={vbTop + 8}
            initial={{ cx: x, opacity: 0 }}
            animate={reduce ? { cx: x, opacity: 1 } : { cx: [x, x - 40, x], opacity: 1 }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}

      {/* Leyenda */}
      <g transform={`translate(${x0} ${H - 14})`}>
        <circle cx={6} cy={-4} r="6" fill="#22d3ee" />
        <text x={18} y={0} fill="#cbd5e1" fontSize="12">
          electrón libre
        </text>
        <circle cx={128} cy={-4} r="6" fill="none" stroke="#fb923c" strokeWidth="2" />
        <text x={140} y={0} fill="#cbd5e1" fontSize="12">
          hueco
        </text>
        <rect x={198} y={-10} width={8} height={10} fill="#fb923c" />
        <text x={212} y={0} fill="#cbd5e1" fontSize="12">
          k·T a esta escala
        </text>
      </g>
    </svg>
  );
}

export const BandDiagram = memo(BandDiagramImpl);
