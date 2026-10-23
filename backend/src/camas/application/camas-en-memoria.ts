import { DomainException } from '../../shared/exceptions/domain.exception';
import { AsignacionCama } from '../domain/entities/asignacion-cama.entity';
import { Cama } from '../domain/entities/cama.entity';
import { type ICamaRepository } from '../domain/repositories/cama-repository.interface';
import { EstadoCama } from '../domain/state/cama-estado';

/** Repositorio en memoria para probar los casos de uso sin base de datos. */
export class CamasEnMemoria implements ICamaRepository {
  readonly camas = new Map<string, Cama>();
  readonly asignaciones: AsignacionCama[] = [];

  /** true => simula que otra petición modificó la cama entre la lectura y el UPDATE. */
  perderCarrera = false;

  agregar(datos: Partial<Cama> = {}): Cama {
    const n = this.camas.size + 1;
    const cama = Object.assign(
      new Cama(),
      { id: `c${n}`, codigo: `A-${n}`, sector: 'Clínica', estado: EstadoCama.LIBRE as string, version: 1 },
      datos,
    );
    this.camas.set(cama.id, cama);
    return cama;
  }

  async findById(id: string) {
    return this.camas.get(id) ?? null;
  }

  async listar() {
    return [...this.camas.values()];
  }

  async crear(codigo: string, sector: string) {
    if ([...this.camas.values()].some((c) => c.codigo === codigo)) {
      throw new DomainException(`Ya existe la cama ${codigo}`);
    }
    return this.agregar({ codigo, sector });
  }

  async findAsignacionVigentePorPaciente(pacienteId: string) {
    return this.asignaciones.find((a) => a.pacienteId === pacienteId && a.hasta === null) ?? null;
  }

  async actualizarEstado(id: string, _versionLeida: number, nuevoEstado: EstadoCama) {
    const cama = this.camas.get(id);
    if (this.perderCarrera || !cama) return false;
    cama.estado = nuevoEstado;
    cama.version += 1;
    return true;
  }

  async asignar(camaId: string, _versionLeida: number, pacienteId: string) {
    const cama = this.camas.get(camaId);
    if (this.perderCarrera || !cama) return null;
    cama.estado = EstadoCama.OCUPADA;
    cama.version += 1;
    const asignacion = Object.assign(new AsignacionCama(), {
      id: `a${this.asignaciones.length + 1}`,
      pacienteId,
      desde: new Date(),
      hasta: null,
    });
    this.asignaciones.push(asignacion);
    return asignacion;
  }

  async liberar(camaId: string, _versionLeida: number) {
    const cama = this.camas.get(camaId);
    if (this.perderCarrera || !cama) return false;
    cama.estado = EstadoCama.EN_LIMPIEZA;
    cama.version += 1;
    for (const a of this.asignaciones) {
      if (a.pacienteId && a.hasta === null) a.hasta = new Date();
    }
    return true;
  }
}
