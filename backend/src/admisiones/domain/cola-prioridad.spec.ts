import { ColaEntreturno } from './entities/cola-entreturno.entity';
import { ordenarCola } from './cola-prioridad';

const item = (id: string, prioridad: string, minuto: number, atendido = false) =>
  Object.assign(new ColaEntreturno(), {
    id, prioridad, atendido, creadoEn: new Date(2026, 10, 3, 9, minuto),
  });

describe('ordenarCola', () => {
  it('pone Código Rojo al frente aunque haya llegado último', () => {
    const cola = ordenarCola([item('a', 'normal', 0), item('b', 'urgente', 1), item('c', 'codigo_rojo', 2)]);
    expect(cola.map((i) => i.id)).toEqual(['c', 'b', 'a']);
  });

  it('a igual prioridad respeta el orden de llegada', () => {
    const cola = ordenarCola([item('b', 'normal', 5), item('a', 'normal', 1)]);
    expect(cola.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('excluye a los ya atendidos', () => {
    expect(ordenarCola([item('a', 'normal', 0, true)])).toEqual([]);
  });
});
