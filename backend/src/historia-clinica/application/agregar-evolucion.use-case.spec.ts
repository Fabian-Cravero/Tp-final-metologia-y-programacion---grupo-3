import { Medico } from '../../admisiones/domain/entities/medico.entity';
import { Evolucion } from '../domain/entities/evolucion.entity';
import { HistoriaClinica } from '../domain/entities/historia-clinica.entity';
import { type IHistoriaClinicaRepository } from '../domain/repositories/historia-clinica-repository.interface';
import { AgregarEvolucionUseCase } from './agregar-evolucion.use-case';

function historiasEnMemoria(guardadas: Evolucion[]): IHistoriaClinicaRepository {
  const historia = Object.assign(new HistoriaClinica(), { id: 'h1', pacienteId: 'p1' });
  return {
    findByPaciente: async (id) => (id === 'p1' ? historia : null),
    agregarEvolucion: async (historiaId, medicoId, nota) => {
      const e = Object.assign(new Evolucion(), { id: `e${guardadas.length + 1}`, medicoId, nota });
      guardadas.push(e);
      return e;
    },
  } as unknown as IHistoriaClinicaRepository;
}

describe('AgregarEvolucionUseCase', () => {
  const medico = Object.assign(new Medico(), { id: 'm1', usuarioId: 'u1' });
  const medicos = { findByUsuarioId: async (u: string) => (u === 'u1' ? medico : null) } as never;

  it('firma la evolución con el médico del usuario logueado', async () => {
    const guardadas: Evolucion[] = [];
    const useCase = new AgregarEvolucionUseCase(historiasEnMemoria(guardadas), medicos);

    await useCase.ejecutar('p1', 'u1', '  Paciente estable.  ');

    expect(guardadas).toHaveLength(1);
    expect(guardadas[0]).toMatchObject({ medicoId: 'm1', nota: 'Paciente estable.' });
  });

  it('rechaza una nota vacía', async () => {
    const useCase = new AgregarEvolucionUseCase(historiasEnMemoria([]), medicos);
    await expect(useCase.ejecutar('p1', 'u1', '   ')).rejects.toThrow('vacía');
  });

  it('falla si el usuario no es un médico registrado', async () => {
    const useCase = new AgregarEvolucionUseCase(historiasEnMemoria([]), medicos);
    await expect(useCase.ejecutar('p1', 'otro-usuario', 'Nota')).rejects.toThrow('no encontrado');
  });

  it('falla con 404 si el paciente no tiene historia', async () => {
    const useCase = new AgregarEvolucionUseCase(historiasEnMemoria([]), medicos);
    await expect(useCase.ejecutar('sin-historia', 'u1', 'Nota')).rejects.toThrow('Historia clínica no encontrado');
  });
});
