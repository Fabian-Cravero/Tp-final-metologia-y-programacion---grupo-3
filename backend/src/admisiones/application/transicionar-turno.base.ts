import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Turno } from '../domain/entities/turno.entity';
import { type ITurnoRepository } from '../domain/repositories/turno-repository.interface';
import { type AccionTurno, siguienteEstado } from '../domain/turno-workflow';

export abstract class TransicionarTurnoBase {
  protected abstract readonly accion: AccionTurno;

  constructor(protected readonly turnos: ITurnoRepository) {}

  async ejecutar(turnoId: string): Promise<Turno> {
    const turno = await this.turnos.findById(turnoId);
    if (!turno) throw new RecursoNoEncontradoException('Turno');

    // El State valida la transición. Si no corresponde, lanza TransicionInvalidaException (422).
    const nuevoEstado = siguienteEstado(turno.estado, this.accion);

    // El UPDATE condicional por versión protege contra dos acciones simultáneas (409).
    const ok = await this.turnos.actualizarEstado(turno.id, turno.version, nuevoEstado);
    if (!ok) throw new ConflictoDeConcurrenciaException('El turno');

    return (await this.turnos.findById(turno.id)) ?? turno;
  }
}
