import { DomainException } from '../../shared/exceptions/domain.exception';
import { type ITurnoRepository } from '../domain/repositories/turno-repository.interface';
import { ListarAgendaUseCase } from './listar-agenda.use-case';

describe('ListarAgendaUseCase', () => {
  const repo = { listarPorMedicoYDia: async () => [] } as unknown as ITurnoRepository;

  it('devuelve la agenda del día', async () => {
    await expect(new ListarAgendaUseCase(repo).ejecutar('m1', new Date('2026-11-03'))).resolves.toEqual([]);
  });

  it('rechaza un día inválido', () => {
    expect(() => new ListarAgendaUseCase(repo).ejecutar('m1', new Date('no-es-fecha'))).toThrow(DomainException);
  });
});
