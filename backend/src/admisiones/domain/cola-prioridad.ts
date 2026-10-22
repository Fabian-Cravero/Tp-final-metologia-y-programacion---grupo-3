import { ColaEntreturno } from './entities/cola-entreturno.entity';

export enum PrioridadTriaje {
  CODIGO_ROJO = 'codigo_rojo',
  URGENTE = 'urgente',
  NORMAL = 'normal',
}

const PESO: Record<string, number> = {
  [PrioridadTriaje.CODIGO_ROJO]: 0,
  [PrioridadTriaje.URGENTE]: 1,
  [PrioridadTriaje.NORMAL]: 2,
};

/** Pendientes ordenados: primero por prioridad, después por orden de llegada. */
export function ordenarCola(items: ColaEntreturno[]): ColaEntreturno[] {
  return items
    .filter((i) => !i.atendido)
    .sort(
      (a, b) =>
        (PESO[a.prioridad] ?? 99) - (PESO[b.prioridad] ?? 99) ||
        a.creadoEn.getTime() - b.creadoEn.getTime(),
    );
}
