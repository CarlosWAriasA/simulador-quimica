import type { MaterialId } from '../../types';

/**
 * Motivo de enlace tetraédrico proyectado en 2D (REPRESENTACIÓN CONCEPTUAL).
 * Si y Ge: todos los átomos iguales (diamante). GaAs: Ga y As alternados (blenda de zinc).
 */
export function BondingMotif({ material }: { material: MaterialId }) {
  const center = material === 'gaas' ? { sym: 'Ga', c: '#94a3b8' } : { sym: material === 'si' ? 'Si' : 'Ge', c: material === 'si' ? '#3987e5' : '#d95926' };
  const outer = material === 'gaas' ? { sym: 'As', c: '#199e70' } : center;
  const pts = [
    [60, 20],
    [100, 60],
    [60, 100],
    [20, 60],
  ];
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" role="img" aria-label={material === 'gaas' ? 'Galio enlazado tetraédricamente a cuatro arsénicos' : `${center.sym} enlazado a cuatro átomos iguales`}>
      {pts.map(([x, y], i) => (
        <g key={i}>
          <line x1={60} y1={60} x2={x} y2={y} stroke="rgba(203,213,225,0.5)" strokeWidth="2" />
          <circle cx={(60 + x) / 2 + (y === 60 ? 0 : 3)} cy={(60 + y) / 2 + (x === 60 ? 0 : 3)} r="2.4" fill="#e0f2fe" />
          <circle cx={(60 + x) / 2 - (y === 60 ? 0 : 3)} cy={(60 + y) / 2 - (x === 60 ? 0 : 3)} r="2.4" fill="#e0f2fe" />
          <circle cx={x} cy={y} r="12" fill={outer.c} fillOpacity="0.25" stroke={outer.c} strokeWidth="1.5" />
          <text x={x} y={y + 4} fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle">
            {outer.sym}
          </text>
        </g>
      ))}
      <circle cx={60} cy={60} r="14" fill={center.c} fillOpacity="0.35" stroke={center.c} strokeWidth="2" />
      <text x={60} y={64} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle">
        {center.sym}
      </text>
    </svg>
  );
}
