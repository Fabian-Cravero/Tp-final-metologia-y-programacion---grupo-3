import { IndicacionMedica } from '../domain/entities/indicacion-medica.entity';
import {
  type IIndicacionRepository,
  type NuevaIndicacion,
} from '../domain/repositories/indicacion-repository.interface';

/** Repositorio en memoria para probar los casos de uso de indicaciones sin base de datos. */
export class IndicacionesEnMemoria implements IIndicacionRepository {
  readonly indicaciones = new Map<string, IndicacionMedica>();

  async crear(d: NuevaIndicacion) {
    const indicacion = Object.assign(new IndicacionMedica(), {
      id: `ind${this.indicaciones.size + 1}`,
      pacienteId: d.pacienteId,
      medicoId: d.medicoId,
      tipo: d.tipo,
      descripcion: d.descripcion,
      insumoId: d.insumoId ?? null,
      cantidad: d.cantidad ?? null,
      estado: 'pendiente',
      creadaEn: new Date(),
    });
    this.indicaciones.set(indicacion.id, indicacion);
    return indicacion;
  }

  async findById(id: string) {
    const i = this.indicaciones.get(id);
    return i ? { ...i } : null; // copia: como la base, cada lectura es una foto
  }

  async listarPendientes(pacienteId: string) {
    return [...this.indicaciones.values()].filter((i) => i.pacienteId === pacienteId && i.estado === 'pendiente');
  }

  async marcarCumplida(id: string) {
    return this.cambiarSiPendiente(id, 'cumplida');
  }

  async cancelar(id: string) {
    return this.cambiarSiPendiente(id, 'cancelada');
  }

  async reabrir(id: string) {
    const i = this.indicaciones.get(id);
    if (i) i.estado = 'pendiente';
  }

  estadoDe(id: string) {
    return this.indicaciones.get(id)?.estado;
  }

  private cambiarSiPendiente(id: string, estado: string) {
    const i = this.indicaciones.get(id);
    if (!i || i.estado !== 'pendiente') return false;
    i.estado = estado;
    return true;
  }
}
