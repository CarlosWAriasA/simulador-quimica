import { useCallback, useEffect, useState } from 'react';
import type { PracticeId, PracticeRecord } from './types';

const KEY = (id: PracticeId) => `thermochip-lab:${id}:v1`;

export const emptyRecord = (): PracticeRecord => ({
  step: 0,
  hypothesis: null,
  rows: [],
  answers: {},
  conclusion: '',
  extra: {},
  updatedAt: 0,
});

/** Lee la bitácora guardada (localStorage puede no estar disponible). */
export function loadRecord(id: PracticeId): PracticeRecord {
  try {
    const raw = window.localStorage.getItem(KEY(id));
    if (!raw) return emptyRecord();
    return { ...emptyRecord(), ...(JSON.parse(raw) as Partial<PracticeRecord>) };
  } catch {
    return emptyRecord();
  }
}

function saveRecord(id: PracticeId, rec: PracticeRecord) {
  try {
    window.localStorage.setItem(KEY(id), JSON.stringify(rec));
  } catch {
    // Sin almacenamiento: la práctica funciona igual, sólo no se recuerda.
  }
}

export type RecordUpdate = Partial<PracticeRecord> | ((r: PracticeRecord) => Partial<PracticeRecord>);

/** Estado persistente de una práctica. */
export function usePracticeRecord(id: PracticeId) {
  const [rec, setRec] = useState<PracticeRecord>(() => loadRecord(id));

  useEffect(() => setRec(loadRecord(id)), [id]);

  const update = useCallback(
    (u: RecordUpdate) =>
      setRec((r) => {
        const patch = typeof u === 'function' ? u(r) : u;
        const next = { ...r, ...patch, updatedAt: Date.now() };
        saveRecord(id, next);
        return next;
      }),
    [id],
  );

  const reset = useCallback(() => {
    const r = emptyRecord();
    saveRecord(id, r);
    setRec(r);
  }, [id]);

  return { rec, update, reset };
}

/** Progreso 0–1 de una práctica (para el panel del laboratorio). */
export function practiceProgress(rec: PracticeRecord, minRows: number, questionCount: number): number {
  let done = 0;
  if (rec.hypothesis) done += 1;
  if (rec.rows.length >= minRows) done += 1;
  const answered = Object.keys(rec.answers).filter((k) => !k.startsWith('_')).length;
  done += Math.min(1, answered / Math.max(1, questionCount));
  if (rec.conclusion.trim().length > 20) done += 1;
  return done / 4;
}
