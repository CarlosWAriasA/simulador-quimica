import { CheckCircle2, XCircle } from 'lucide-react';
import type { MultipleChoice } from '../types';

interface Props {
  q: MultipleChoice;
  value: string | null | undefined;
  onChange: (id: string) => void;
  /** Muestra si la respuesta es correcta y la explicación. */
  reveal: boolean;
  index?: number;
}

/** Pregunta de opción múltiple con retroalimentación. */
export function ChoiceQuestion({ q, value, onChange, reveal, index }: Props) {
  const correct = value === q.correct;
  return (
    <fieldset className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <legend className="sr-only">{q.text}</legend>
      <p className="text-base font-semibold text-white" aria-hidden>
        {index !== undefined && <span className="mr-2 text-cyan-300">{index}.</span>}
        {q.text}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const selected = value === o.id;
          const showRight = reveal && o.id === q.correct;
          const showWrong = reveal && selected && !correct;
          return (
            <label
              key={o.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                showRight
                  ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-50'
                  : showWrong
                    ? 'border-red-400/60 bg-red-400/10 text-red-50'
                    : selected
                      ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                      : 'border-white/[0.08] text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              <input type="radio" name={`${q.id}-${q.text.length}`} className="mt-0.5 accent-cyan-400" checked={selected} onChange={() => onChange(o.id)} />
              <span>{o.text}</span>
            </label>
          );
        })}
      </div>
      {reveal && value && (
        <div className={`mt-3 flex gap-2 rounded-xl p-3 text-sm ${correct ? 'bg-emerald-400/10 text-emerald-100' : 'bg-amber-400/10 text-amber-100'}`} role="status">
          {correct ? <CheckCircle2 size={18} className="shrink-0 text-emerald-300" aria-hidden /> : <XCircle size={18} className="shrink-0 text-amber-300" aria-hidden />}
          <span>
            <strong>{correct ? '¡Correcto! ' : 'Revisa: '}</strong>
            {q.explanation}
          </span>
        </div>
      )}
    </fieldset>
  );
}
