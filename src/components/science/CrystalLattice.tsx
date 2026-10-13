import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import type { DopantId } from '../../types';

const COLS = 7;
const ROWS = 5;
const STEP = 78;
const PAD = 46;
const W = PAD * 2 + STEP * (COLS - 1);
const H = PAD * 2 + STEP * (ROWS - 1);

/** Posiciones (col, fila) donde pueden aparecer dopantes, en orden. */
const DOPANT_SITES: Array<[number, number]> = [
  [2, 2],
  [5, 1],
  [1, 3],
  [4, 3],
  [5, 4],
  [1, 0],
];
/** Enlaces (col, fila, dirección) donde se dibujan pares térmicos. */
const THERMAL_SITES: Array<[number, number, 'h' | 'v']> = [
  [3, 0, 'h'],
  [0, 1, 'v'],
  [5, 2, 'v'],
  [2, 4, 'h'],
  [4, 1, 'h'],
  [6, 3, 'v'],
];

const ax = (c: number) => PAD + c * STEP;
const ay = (r: number) => PAD + r * STEP;

interface Props {
  dopant: DopantId;
  /** Número de átomos dopantes a dibujar (conceptual). */
  dopantCount: number;
  /** Número de enlaces rotos por agitación térmica (conceptual). */
  thermalPairs: number;
}

/**
 * Red cristalina 2D simplificada del silicio (REPRESENTACIÓN CONCEPTUAL):
 * cada línea es un enlace covalente con 2 electrones compartidos.
 */
function CrystalLatticeImpl({ dopant, dopantCount, thermalPairs }: Props) {
  const reduce = useReducedMotion();
  const sites = dopant === 'intrinseco' ? [] : DOPANT_SITES.slice(0, dopantCount);
  const isSite = (c: number, r: number) => sites.some(([sc, sr]) => sc === c && sr === r);
  const brokenBonds = THERMAL_SITES.slice(0, thermalPairs);

  const bonds: Array<{ x1: number; y1: number; x2: number; y2: number; key: string; missing: boolean; broken: boolean }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1) {
        const missing = dopant === 'boro' && sites.some(([sc, sr]) => sc === c && sr === r);
        const broken = brokenBonds.some(([bc, br, d]) => bc === c && br === r && d === 'h');
        bonds.push({ x1: ax(c), y1: ay(r), x2: ax(c + 1), y2: ay(r), key: `h${c}-${r}`, missing, broken });
      }
      if (r < ROWS - 1) {
        const broken = brokenBonds.some(([bc, br, d]) => bc === c && br === r && d === 'v');
        bonds.push({ x1: ax(c), y1: ay(r), x2: ax(c), y2: ay(r + 1), key: `v${c}-${r}`, missing: false, broken });
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Red cristalina simplificada de silicio con enlaces covalentes">
      <rect x="0" y="0" width={W} height={H} rx="16" fill="rgba(2,6,23,0.4)" />
      {bonds.map((b) => {
        const mx = (b.x1 + b.x2) / 2;
        const my = (b.y1 + b.y2) / 2;
        const horiz = b.y1 === b.y2;
        const off = 6;
        const e1 = horiz ? [mx - off, my] : [mx, my - off];
        const e2 = horiz ? [mx + off, my] : [mx, my + off];
        return (
          <g key={b.key}>
            <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="rgba(148,163,184,0.35)" strokeWidth="4" strokeLinecap="round" />
            {!b.broken && <circle cx={e1[0]} cy={e1[1]} r="4" fill="#bae6fd" />}
            {!b.missing && !b.broken && <circle cx={e2[0]} cy={e2[1]} r="4" fill="#bae6fd" />}
            {b.broken && (
              <>
                <circle cx={e1[0]} cy={e1[1]} r="6" fill="#0b1220" stroke="#fb923c" strokeWidth="2" />
                <motion.circle
                  r="5"
                  fill="#22d3ee"
                  initial={{ cx: e2[0], cy: e2[1] }}
                  animate={reduce ? { cx: e2[0] + 14, cy: e2[1] - 18 } : { cx: [e2[0], e2[0] + 22, e2[0] + 40, e2[0]], cy: [e2[1], e2[1] - 26, e2[1] - 8, e2[1]] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}
                />
              </>
            )}
            {b.missing && (
              <motion.circle
                r="6.5"
                fill="#0b1220"
                stroke="#fb923c"
                strokeWidth="2.5"
                initial={{ cx: e2[0], cy: e2[1] }}
                animate={reduce ? { cx: e2[0], cy: e2[1] } : { cx: [e2[0], e2[0], e2[0] - STEP, e2[0] - STEP, e2[0]], cy: [e2[1], e2[1], e2[1], e2[1], e2[1]] }}
                transition={{ duration: 6, repeat: Infinity, times: [0, 0.35, 0.5, 0.85, 1], ease: 'easeInOut' }}
              />
            )}
          </g>
        );
      })}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const doped = isSite(c, r);
          const sym = doped ? (dopant === 'fosforo' ? 'P' : 'B') : 'Si';
          const color = doped ? (dopant === 'fosforo' ? '#22d3ee' : '#fb923c') : '#64748b';
          return (
            <g key={`${c}-${r}`}>
              <motion.circle
                cx={ax(c)}
                cy={ay(r)}
                r={doped ? 19 : 17}
                fill={doped ? `${color}40` : '#1e293b'}
                stroke={color}
                strokeWidth={doped ? 3 : 1.5}
                initial={doped ? { scale: 0.4, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                style={{ transformOrigin: `${ax(c)}px ${ay(r)}px` }}
              />
              <text x={ax(c)} y={ay(r) + 5} textAnchor="middle" fontSize={doped ? 15 : 13} fontWeight="700" fill="#fff">
                {sym}
              </text>
            </g>
          );
        }),
      )}
      {/* Quinto electrón del fósforo: débilmente ligado, se libera y se mueve por la red */}
      {dopant === 'fosforo' &&
        sites.map(([c, r], i) => {
          const x = ax(c) + STEP / 2;
          const y = ay(r) - STEP / 2 + (r === 0 ? STEP : 0);
          return (
            <motion.circle
              key={`free-${i}`}
              r="6"
              fill="#22d3ee"
              initial={{ cx: ax(c) + 22, cy: ay(r) - 22 }}
              animate={
                reduce
                  ? { cx: x, cy: y }
                  : { cx: [ax(c) + 22, x, x + STEP, x + STEP / 2, ax(c) + 22], cy: [ay(r) - 22, y, y, y + STEP * 0.9 * (r < 2 ? 1 : -1), ay(r) - 22] }
              }
              transition={{ duration: 7 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
              style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
            />
          );
        })}
    </svg>
  );
}

export const CrystalLattice = memo(CrystalLatticeImpl);
