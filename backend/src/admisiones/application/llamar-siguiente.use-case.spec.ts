import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { ColaEntreturno } from '../domain/entities/cola-entreturno.entity';
import { type IColaRepository } from '../domain/repositories/cola-repository.interface';
import { LlamarSiguienteUseCase } from './llamar-siguiente.use-case';

function item(id: string, prioridad: string, minuto: number): ColaEntreturno {
  return Object.assign(new ColaEntreturno(), {
    id,
    prioridad,
    atendido: false,
    creadoEn: new Date(2026, 0, 1, 10, minuto),
  });
}

function colaCon(items: ColaEntreturno[], marcar = true): IColaRepository {
  return {
    agregar: async () => items[0],
    pendientesPorMedico: async () => items,
    marcarAtendido: async () => marcar,
  };
}

describe('LlamarSiguienteUseCase', () => {
  it('llama primero al código rojo, aunque haya llegado después', async () => {
    const uc = new LlamarSiguienteUseCase(
      colaCon([item('normal', 'normal', 0), item('rojo', 'codigo_rojo', 5)]),
    );

    expect((await uc.ejecutar('m1')).id).toBe('rojo');
  });

  it('con la misma prioridad respeta el orden de llegada', async () => {
    const uc = new LlamarSiguienteUseCase(
      colaCon([item('segundo', 'urgente', 9), item('primero', 'urgente', 1)]),
    );

    expect((await uc.ejecutar('m1')).id).toBe('primero');
  });

  it('con la cola vacía responde recurso no encontrado', async () => {
    const uc = new LlamarSiguienteUseCase(colaCon([]));

    await expect(uc.ejecutar('m1')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });

  it('si otro médico lo llamó primero responde conflicto', async () => {
    const uc = new LlamarSiguienteUseCase(colaCon([item('a', 'normal', 0)], false));

    await expect(uc.ejecutar('m1')).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });
});
