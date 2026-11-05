import { Medico } from '../../admisiones/domain/entities/medico.entity';
import { type IMedicoRepository } from '../../admisiones/domain/repositories/medico-repository.interface';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { AgregarEvolucionUseCase } from './agregar-evolucion.use-case';
import { HistoriasEnMemoria } from './historias-en-memoria';

describe('AgregarEvolucionUseCase', () => {
  const medico = Object.assign(new Medico(), { id: 'm1', usuarioId: 'u1' });
  const medicos = {
    findByUsuarioId: async (u: string) => (u === 'u1' ? medico : null),
  } as unknown as IMedicoRepository;

  let repo: HistoriasEnMemoria;

  beforeEach(async () => {
    repo = new HistoriasEnMemoria();
    await repo.crear('p1', null);
  });

  it('firma la evolución con el médico del usuario logueado', async () => {
    await new AgregarEvolucionUseCase(repo, medicos).ejecutar('p1', 'u1', '  Paciente estable.  ');

    const evoluciones = await repo.listarEvoluciones('h1', 10);
    expect(evoluciones).toHaveLength(1);
    expect(evoluciones[0]).toMatchObject({ medicoId: 'm1', nota: 'Paciente estable.' });
  });

  it('rechaza una nota vacía', async () => {
    const useCase = new AgregarEvolucionUseCase(repo, medicos);
    await expect(useCase.ejecutar('p1', 'u1', '   ')).rejects.toBeInstanceOf(DomainException);
  });

  it('falla si el usuario no es un médico registrado', async () => {
    const useCase = new AgregarEvolucionUseCase(repo, medicos);
    await expect(useCase.ejecutar('p1', 'otro-usuario', 'Nota')).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });

  it('falla con 404 si el paciente no tiene historia', async () => {
    const useCase = new AgregarEvolucionUseCase(repo, medicos);
    await expect(useCase.ejecutar('sin-historia', 'u1', 'Nota')).rejects.toThrow('Historia clínica no encontrado');
  });
});
