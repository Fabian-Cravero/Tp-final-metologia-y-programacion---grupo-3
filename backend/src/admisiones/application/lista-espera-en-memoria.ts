import { DomainException } from '../../shared/exceptions/domain.exception';
import { EstadoListaEspera, ListaEspera } from '../domain/entities/lista-espera.entity';
import { Paciente } from '../domain/entities/paciente.entity';
import { type IListaEsperaRepository } from '../domain/repositories/lista-espera-repository.interface';

/** Lista de espera en memoria para los tests. Imita el índice único y los UPDATE condicionales. */
export class ListaEsperaEnMemoria implements IListaEsperaRepository {
  readonly registros: ListaEspera[] = [];
  private siguienteId = 1;
  private reloj = 0;

  async agregar(pacienteId: string, medicoId: string, dia: string) {
    const repetido = this.registros.some(
      (r) => r.paciente.id === pacienteId && r.medico.id === medicoId && r.dia === dia && r.estado === EstadoListaEspera.ESPERANDO,
    );
    if (repetido) throw new DomainException('El paciente ya está en la lista de espera de ese médico para ese día');

    const registro = Object.assign(new ListaEspera(), {
      id: `le${this.siguienteId++}`,
      paciente: Object.assign(new Paciente(), { id: pacienteId, nombre: 'Nombre', apellido: pacienteId }),
      medico: { id: medicoId },
      dia,
      estado: EstadoListaEspera.ESPERANDO,
      turnoAsignadoId: null,
      fechaHoraAsignada: null,
      avisado: false,
      creadoEn: new Date(this.reloj++), // orden de llegada
    });
    this.registros.push(registro);
    return registro;
  }

  async findById(id: string) {
    return this.registros.find((r) => r.id === id) ?? null;
  }

  async listarPorMedicoYDia(medicoId: string, dia: string) {
    return this.registros.filter((r) => r.medico.id === medicoId && r.dia === dia);
  }

  async esperandoPorMedicoYDia(medicoId: string, dia: string) {
    return (await this.listarPorMedicoYDia(medicoId, dia)).filter((r) => r.estado === EstadoListaEspera.ESPERANDO);
  }

  async tomar(id: string) {
    const r = this.registros.find((x) => x.id === id && x.estado === EstadoListaEspera.ESPERANDO);
    if (!r) return false;
    r.estado = EstadoListaEspera.ASIGNADO;
    return true;
  }

  async registrarAsignacion(id: string, turnoId: string, fechaHora: Date) {
    const r = this.registros.find((x) => x.id === id)!;
    r.turnoAsignadoId = turnoId;
    r.fechaHoraAsignada = fechaHora;
  }

  async devolverALaEspera(id: string) {
    const r = this.registros.find((x) => x.id === id && x.estado === EstadoListaEspera.ASIGNADO);
    if (r) Object.assign(r, { estado: EstadoListaEspera.ESPERANDO, turnoAsignadoId: null, fechaHoraAsignada: null });
  }

  async marcarAvisado(id: string) {
    const r = this.registros.find((x) => x.id === id && !x.avisado);
    if (!r) return false;
    r.avisado = true;
    return true;
  }
}
