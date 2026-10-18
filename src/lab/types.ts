export type PracticeId = 'p1' | 'p2' | 'p3' | 'p4';

export type Cell = number | string;
export type DataRow = Record<string, Cell>;

export interface Choice {
  id: string;
  text: string;
}

export interface MultipleChoice {
  id: string;
  text: string;
  options: Choice[];
  correct: string;
  explanation: string;
}

export interface Column {
  key: string;
  label: string;
  unit?: string;
  /** Formato del valor; por defecto se muestra tal cual. */
  format?: 'fixed1' | 'fixed2' | 'fixed3' | 'sci' | 'int' | 'text';
}

export interface PracticeDef {
  id: PracticeId;
  n: number;
  title: string;
  short: string;
  minutes: number;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  objective: string;
  concepts: string[];
  instruments: string[];
  hypothesis: MultipleChoice;
  procedure: string[];
  minRows: number;
  columns: Column[];
  questions: MultipleChoice[];
  refs: string[];
}

/** Estado guardado de una práctica (bitácora del estudiante). */
export interface PracticeRecord {
  step: number;
  hypothesis: string | null;
  rows: DataRow[];
  answers: Record<string, string>;
  conclusion: string;
  extra: Record<string, Cell>;
  updatedAt: number;
}
