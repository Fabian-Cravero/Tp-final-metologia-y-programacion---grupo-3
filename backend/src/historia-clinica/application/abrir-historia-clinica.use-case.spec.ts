import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { AbrirHistoriaClinicaUseCase } from './abrir-historia-clinica.use-case';
import { HistoriasEnMemoria } from './historias-en-memoria';

const pacientes = {
  findById: async (id: string) => (id.startsWith('p') ? { id } : null),
} as unknown as IPacienteRepository;

describe('AbrirHistoriaClinicaUseCase', () => {
  it('abre la historia de un paciente con su grupo sanguíneo', async () => {
    const repo = new HistoriasEnMemoria();

    const historia = await new AbrirHistoriaClinicaUseCase(repo, pacientes).ejecutar('p1', 'A+');

    expect(historia).toMatchObject({ pacienteId: 'p1', grupoSanguineo: 'A+' });
  });

  it('abrirla dos veces devuelve la misma historia, sin duplicar', async () => {
    const repo = new HistoriasEnMemoria();
    const useCase = new AbrirHistoriaClinicaUseCase(repo, pacientes);

    const primera = await useCase.ejecutar('p1');
    const segunda = await useCase.ejecutar('p1', 'B-');

    expect(segunda.id).toBe(primera.id);
    expect(repo.historias).toHaveLength(1);
  });

  it('sin grupo sanguíneo lo guarda como null', async () => {
    const historia = await new AbrirHistoriaClinicaUseCase(new HistoriasEnMemoria(), pacientes).ejecutar('p1');

    expect(historia.grupoSanguineo).toBeNull();
  });

  it('responde 404 si el paciente no existe en Admisiones', async () => {
    const useCase = new AbrirHistoriaClinicaUseCase(new HistoriasEnMemoria(), pacientes);

    await expect(useCase.ejecutar('x1')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });
});
