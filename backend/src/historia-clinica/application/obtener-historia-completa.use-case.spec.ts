import { type IMedicoRepository } from '../../admisiones/domain/repositories/medico-repository.interface';
import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import {
  AccesoDenegadoException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { HistoriasEnMemoria } from './historias-en-memoria';
import { ObtenerHistoriaCompletaUseCase } from './obtener-historia-completa.use-case';

/** El usuario 'u-ana' es la paciente 'p1'. */
const pacientes = {
  findByUsuarioId: async (u: string) => (u === 'u-ana' ? { id: 'p1' } : null),
} as unknown as IPacienteRepository;

/** El médico 'm1' es la Dra. Laura Martínez. */
const medicos = {
  findById: async (id: string) =>
    id === 'm1' ? { id, nombre: 'Laura', apellido: 'Martínez', matricula: 'MP-3001', especialidad: 'Clínica médica' } : null,
} as unknown as IMedicoRepository;

describe('ObtenerHistoriaCompletaUseCase', () => {
  let repo: HistoriasEnMemoria;
  let useCase: ObtenerHistoriaCompletaUseCase;

  beforeEach(async () => {
    repo = new HistoriasEnMemoria();
    useCase = new ObtenerHistoriaCompletaUseCase(repo, pacientes, medicos);
    const h = await repo.crear('p1', 'O+');
    await repo.agregarAlergia(h.id, 'Penicilina', 'grave');
    await repo.agregarAntecedente(h.id, 'madre', 'Hipertensión');
    await repo.agregarEvolucion(h.id, 'm1', 'Primera consulta');
    await repo.agregarEvolucion(h.id, 'm1', 'Control');
  });

  it('devuelve alergias, antecedentes y evoluciones, de la más nueva a la más vieja', async () => {
    const r = await useCase.ejecutar('p1', { id: 'u-medico', rol: RolUsuario.MEDICO });

    expect(r.historia.grupoSanguineo).toBe('O+');
    expect(r.alergias).toHaveLength(1);
    expect(r.antecedentes).toHaveLength(1);
    expect(r.evoluciones.map((e) => e.nota)).toEqual(['Control', 'Primera consulta']);
  });

  it('cada evolución trae el médico que la firmó', async () => {
    const r = await useCase.ejecutar('p1');

    expect(r.evoluciones[0].medico).toEqual({
      id: 'm1', nombre: 'Laura', apellido: 'Martínez', matricula: 'MP-3001', especialidad: 'Clínica médica',
    });
  });

  it('respeta el límite de evoluciones', async () => {
    const r = await useCase.ejecutar('p1', undefined, 1);

    expect(r.evoluciones.map((e) => e.nota)).toEqual(['Control']);
  });

  it('un paciente puede ver su propia historia', async () => {
    const r = await useCase.ejecutar('p1', { id: 'u-ana', rol: RolUsuario.PACIENTE });

    expect(r.historia.pacienteId).toBe('p1');
  });

  it('un paciente no puede ver la historia de otro (403)', async () => {
    await expect(useCase.ejecutar('p1', { id: 'u-otro', rol: RolUsuario.PACIENTE })).rejects.toBeInstanceOf(
      AccesoDenegadoException,
    );
  });

  it('sin historia abierta responde 404', async () => {
    await expect(useCase.ejecutar('p2', { id: 'u-medico', rol: RolUsuario.MEDICO })).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });
});
