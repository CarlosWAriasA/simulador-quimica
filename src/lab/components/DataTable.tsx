import { NotebookPen, Trash2 } from 'lucide-react';
import { fmt, fmtSci } from '../../utils/format';
import type { Cell, Column, DataRow } from '../types';

export function formatCell(col: Column, v: Cell | undefined): string {
  if (v === undefined || v === '') return '—';
  if (typeof v === 'string') return v;
  switch (col.format) {
    case 'fixed1':
      return fmt(v, 1);
    case 'fixed2':
      return fmt(v, 2);
    case 'fixed3':
      return fmt(v, 3);
    case 'sci':
      return fmtSci(v, 3);
    case 'int':
      return fmt(v, 0);
    default:
      return String(v);
  }
}

interface Props {
  columns: Column[];
  rows: DataRow[];
  onDelete?: (index: number) => void;
  onClear?: () => void;
  minRows?: number;
  title?: string;
}

/** Bitácora de datos del experimento. */
export function DataTable({ columns, rows, onDelete, onClear, minRows, title = 'Bitácora de datos' }: Props) {
  return (
    <div className="rounded-2xl border border-amber-200/10 bg-amber-50/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-100">
          <NotebookPen size={16} aria-hidden /> {title}
          <span className="font-normal text-slate-400">
            · {rows.length} {rows.length === 1 ? 'medición' : 'mediciones'}
            {minRows ? ` (mínimo ${minRows})` : ''}
          </span>
        </h3>
        {onClear && rows.length > 0 && (
          <button type="button" onClick={onClear} className="text-xs text-slate-400 hover:text-red-300">
            Borrar todo
          </button>
        )}
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="px-4 py-2 font-medium">#</th>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-3 py-2 font-medium">
                  {c.label}
                  {c.unit && <span className="text-slate-500"> [{c.unit}]</span>}
                </th>
              ))}
              {onDelete && <th className="w-10" />}
            </tr>
          </thead>
          <tbody className="num divide-y divide-white/5">
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-6 text-center font-sans text-slate-500">
                  Aún no hay mediciones. Realiza el experimento y pulsa «Registrar medición».
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="text-slate-100">
                <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                {columns.map((c) => (
                  <td key={c.key} className={`whitespace-nowrap px-3 py-2 ${r[c.key] === 'no' ? 'text-amber-300' : ''}`}>
                    {formatCell(c, r[c.key])}
                  </td>
                ))}
                {onDelete && (
                  <td className="px-2 py-1">
                    <button type="button" onClick={() => onDelete(i)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-300" aria-label={`Eliminar medición ${i + 1}`}>
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
