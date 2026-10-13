import { REF_INDEX, refById } from '../../data/references';

/** Cita numérica [1, 4] que enlaza con la lista de referencias. */
export function RefCite({ ids }: { ids: string[] }) {
  const valid = ids.filter((id) => REF_INDEX[id] !== undefined);
  if (valid.length === 0) return null;
  return (
    <span className="whitespace-nowrap text-[11px] font-medium normal-case tracking-normal text-slate-400">
      [
      {valid.map((id, i) => (
        <span key={id}>
          {i > 0 && ', '}
          <a href="#/proyecto?ref=referencias" title={refById(id)?.apa} className="text-cyan-300/90 hover:underline">
            {REF_INDEX[id]}
          </a>
        </span>
      ))}
      ]
    </span>
  );
}
