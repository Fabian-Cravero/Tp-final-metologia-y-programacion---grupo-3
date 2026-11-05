import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { ProtocoloCuidado } from '../domain/entities/protocolo-cuidado.entity';
import { TareaProtocolo } from '../domain/entities/tarea-protocolo.entity';
import { type PlanProtocolo } from '../domain/protocolos/protocolo.builder';
import { MotivoIngreso } from '../domain/protocolos/protocolo.director';
import { type IProtocoloRepository } from '../domain/repositories/protocolo-repository.interface';
import { CompletarTareaUseCase } from './completar-tarea.use-case';
import { ConsultarProtocolosUseCase } from './consultar-protocolos.use-case';
import { IniciarProtocoloUseCase } from './iniciar-protocolo.use-case';

class ProtocolosEnMemoria implements IProtocoloRepository {
  readonly protocolos: ProtocoloCuidado[] = [];
  readonly tareas: { protocoloId: string; tarea: TareaProtocolo }[] = [];

  async crearConTareas(pacienteId: string, plan: PlanProtocolo) {
    const protocolo = Object.assign(new ProtocoloCuidado(), {
      id: `pr${this.protocolos.length + 1}`,
      pacienteId,
      motivoIngreso: plan.motivoIngreso,
      estado: 'activo',
      creadoEn: new Date(),
    });
    this.protocolos.push(protocolo);
    for (const t of plan.tareas) {
      const tarea = Object.assign(new TareaProtocolo(), {
        id: `${protocolo.id}-t${t.orden}`,
        descripcion: t.descripcion,
        orden: t.orden,
        completada: false,
        completadaEn: null,
      });
      this.tareas.push({ protocoloId: protocolo.id, tarea });
    }
    return protocolo;
  }

  async findById(id: string) { return this.protocolos.find((p) => p.id === id) ?? null; }
  async listarDePaciente(pacienteId: string) { return this.protocolos.filter((p) => p.pacienteId === pacienteId); }
  async tareasDe(protocoloId: string) {
    return this.tareas.filter((t) => t.protocoloId === protocoloId).map((t) => t.tarea).sort((a, b) => a.orden - b.orden);
  }
  async completarTarea(tareaId: string) {
    const t = this.tareas.find((x) => x.tarea.id === tareaId)?.tarea;
    if (!t || t.completada) return false;
    t.completada = true;
    t.completadaEn = new Date();
    return true;
  }
  async protocoloDeTarea(tareaId: string) { return this.tareas.find((x) => x.tarea.id === tareaId)?.protocoloId ?? null; }
  async contarPendientes(protocoloId: string) {
    return this.tareas.filter((x) => x.protocoloId === protocoloId && !x.tarea.completada).length;
  }
  async finalizar(protocoloId: string) {
    const p = this.protocolos.find((x) => x.id === protocoloId);
    if (p) p.estado = 'finalizado';
  }
}

const pacientes = { findById: async (id: string) => (id === 'p1' ? { id } : null) } as unknown as IPacienteRepository;

describe('Protocolos de cuidado', () => {
  let repo: ProtocolosEnMemoria;

  beforeEach(() => {
    repo = new ProtocolosEnMemoria();
  });

  it('iniciar un pre-operatorio crea el protocolo con sus siete tareas numeradas', async () => {
    const r = await new IniciarProtocoloUseCase(repo, pacientes).ejecutar('p1', MotivoIngreso.PRE_OPERATORIO);

    expect(r.protocolo).toMatchObject({ pacienteId: 'p1', motivoIngreso: 'pre_operatorio', estado: 'activo' });
    expect(r.tareas.map((t) => t.orden)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('rechaza un paciente inexistente o un motivo sin receta', async () => {
    const useCase = new IniciarProtocoloUseCase(repo, pacientes);

    await expect(useCase.ejecutar('p9', MotivoIngreso.RESPIRATORIO)).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
    await expect(useCase.ejecutar('p1', 'desconocido')).rejects.toBeInstanceOf(DomainException);
  });

  it('completar todas las tareas finaliza el protocolo', async () => {
    const { protocolo, tareas } = await new IniciarProtocoloUseCase(repo, pacientes).ejecutar(
      'p1',
      MotivoIngreso.RESPIRATORIO,
    );
    const completar = new CompletarTareaUseCase(repo);

    for (const t of tareas.slice(0, -1)) {
      expect((await completar.ejecutar(t.id)).protocoloFinalizado).toBe(false);
    }
    const ultima = await completar.ejecutar(tareas[tareas.length - 1].id);

    expect(ultima).toMatchObject({ pendientes: 0, protocoloFinalizado: true });
    expect((await repo.findById(protocolo.id))?.estado).toBe('finalizado');
  });

  it('completar dos veces la misma tarea da conflicto (409)', async () => {
    const { tareas } = await new IniciarProtocoloUseCase(repo, pacientes).ejecutar('p1', MotivoIngreso.RESPIRATORIO);
    const completar = new CompletarTareaUseCase(repo);
    await completar.ejecutar(tareas[0].id);

    await expect(completar.ejecutar(tareas[0].id)).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });

  it('una tarea o un protocolo inexistente da 404', async () => {
    await expect(new CompletarTareaUseCase(repo).ejecutar('nada')).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
    await expect(new ConsultarProtocolosUseCase(repo).conTareas('nada')).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });

  it('lista los protocolos del paciente', async () => {
    await new IniciarProtocoloUseCase(repo, pacientes).ejecutar('p1', MotivoIngreso.RESPIRATORIO);

    expect(await new ConsultarProtocolosUseCase(repo).delPaciente('p1')).toHaveLength(1);
  });
});
