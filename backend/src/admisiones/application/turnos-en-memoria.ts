import { ConflictoDeConcurrenciaException } from '../../shared/exceptions/domain.exception';
import { Turno } from '../domain/entities/turno.entity';
import {
  type ITurnoRepository,
  type NuevoEntreturno,
  type NuevoTurno,
} from '../domain/repositories/turno-repository.interface';
import { type EstadoTurno } from '../domain/state/turno-estado';

/**
 * Repositorio de turnos en memoria para los tests (sin base de datos).
 * Imita lo que garantiza PostgreSQL: el índice único (médico + horario de turnos no cancelados)
 * y el UPDATE condicional por versión.
 */
export class TurnosEnMemoria implements ITurnoRepository {
  readonly turnos: Turno[] = [];
  private siguienteId = 1;

  agregar(datos: Partial<Turno> & { medicoId?: string; pacienteId?: string }): Turno {
    const turno = Object.assign(new Turno(), {
      id: `t${this.siguienteId++}`,
      estado: 'programado',
      version: 1,
      duracionMinutos: 30,
      esEntreturno: false,
      duracionReducida: false,
      motivo: null,
      prioridad: 'normal',
      ...datos,
      medico: { id: datos.medicoId ?? 'm1' },
      paciente: { id: datos.pacienteId ?? 'p1' },
    });
    this.turnos.push(turno);
    return turno;
  }

  private horarioTomado(medicoId: string, fechaHora: Date) {
    return this.turnos.some(
      (t) => t.medico.id === medicoId && t.estado !== 'cancelado' && t.fechaHora.getTime() === fechaHora.getTime(),
    );
  }

  async findById(id: string) {
    return this.turnos.find((t) => t.id === id) ?? null;
  }

  async crear(d: NuevoTurno): Promise<Turno> {
    if (this.horarioTomado(d.medicoId, d.fechaHora)) throw new ConflictoDeConcurrenciaException('El horario');
    return this.agregar({ ...d, motivo: d.motivo ?? null, duracionMinutos: d.duracionMinutos ?? 30 });
  }

  async actualizarEstado(id: string, versionLeida: number, nuevoEstado: EstadoTurno) {
    const turno = this.turnos.find((t) => t.id === id && t.version === versionLeida);
    if (!turno) return false;
    turno.estado = nuevoEstado;
    turno.version++;
    return true;
  }

  async listarPorMedicoYDia(medicoId: string, dia: Date) {
    const mismoDia = (f: Date) => f.toDateString() === dia.toDateString();
    return this.turnos
      .filter((t) => t.medico.id === medicoId && mismoDia(t.fechaHora))
      .sort((x, y) => x.fechaHora.getTime() - y.fechaHora.getTime());
  }

  async insertarEntreturno(d: NuevoEntreturno): Promise<Turno> {
    const anterior = this.turnos.find((t) => t.id === d.turnoAnteriorId && t.version === d.versionAnterior);
    if (!anterior) throw new ConflictoDeConcurrenciaException('El turno anterior');
    if (this.horarioTomado(d.medicoId, d.fechaHora)) throw new ConflictoDeConcurrenciaException('El horario');

    anterior.duracionMinutos = d.nuevaDuracionAnterior;
    anterior.duracionReducida = true;
    anterior.version++;
    return this.agregar({ ...d, motivo: d.motivo ?? null, esEntreturno: true });
  }
}
