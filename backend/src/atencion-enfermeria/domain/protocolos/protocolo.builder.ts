import { DomainException } from '../../../shared/exceptions/domain.exception';

export interface TareaPlan {
  descripcion: string;
  orden: number;
}

export interface PlanProtocolo {
  motivoIngreso: string;
  tareas: TareaPlan[];
}

/** Builder: arma el protocolo paso a paso y valida que quede completo. */
export class ProtocoloBuilder {
  private motivo = '';
  private readonly tareas: string[] = [];

  conMotivo(motivo: string): this {
    this.motivo = motivo;
    return this;
  }

  agregarTarea(descripcion: string): this {
    this.tareas.push(descripcion);
    return this;
  }

  build(): PlanProtocolo {
    if (!this.motivo) throw new DomainException('El protocolo necesita un motivo de ingreso');
    if (this.tareas.length === 0) throw new DomainException('El protocolo necesita al menos una tarea');

    return {
      motivoIngreso: this.motivo,
      tareas: this.tareas.map((descripcion, i) => ({ descripcion, orden: i + 1 })),
    };
  }
}
