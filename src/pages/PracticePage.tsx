import type { ComponentType } from 'react';
import { isPracticeId } from '../lab/practices';
import { Practice1 } from '../lab/practices/Practice1';
import { Practice2 } from '../lab/practices/Practice2';
import { Practice3 } from '../lab/practices/Practice3';
import { Practice4 } from '../lab/practices/Practice4';
import type { PracticeId } from '../lab/types';

const COMPONENTS: Record<PracticeId, ComponentType> = { p1: Practice1, p2: Practice2, p3: Practice3, p4: Practice4 };

export function PracticePage({ id }: { id: string }) {
  if (!isPracticeId(id)) {
    return (
      <div className="panel mx-auto mt-10 max-w-xl p-6 text-center">
        <h1 className="text-xl font-bold">Práctica no encontrada</h1>
        <a href="#/laboratorio" className="btn-primary mt-4">
          Volver al laboratorio
        </a>
      </div>
    );
  }
  const C = COMPONENTS[id];
  return <C key={id} />;
}
