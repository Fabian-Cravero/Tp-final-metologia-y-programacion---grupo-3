import { Inject, Injectable } from '@nestjs/common';
import {
  DescontarInsumoUseCase,
  type InsumoDescontado,
} from '../../camas/application/descontar-insumo.use-case';
import { EVENT_PUBLISHER, type IEventPublisher } from '../../shared/events/event-publisher.interface';
import { EVENTOS, type MedicacionAdministradaPayload } from '../../shared/events/eventos';
import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import {
  type IIndicacionRepository,
  INDICACION_REPOSITORY,
} from '../domain/repositories/indicacion-repository.interface';

export interface IndicacionCumplida {
  indicacionId: string;
  estado: 'cumplida';
  /** Solo para medicación: qué se descontó del inventario. */
  insumoDescontado?: { nombre: string; cantidad: number };
}

@Injectable()
export class CumplirIndicacionUseCase {
  constructor(
    @Inject(INDICACION_REPOSITORY) private readonly indicaciones: IIndicacionRepository,
    private readonly descontarInsumo: DescontarInsumoUseCase,
    @Inject(EVENT_PUBLISHER) private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(indicacionId: string): Promise<IndicacionCumplida> {
    const indicacion = await this.indicaciones.findById(indicacionId);
    if (!indicacion) throw new RecursoNoEncontradoException('Indicación');

    // 1. Reclamar la indicación: si dos enfermeros llegan juntos, solo uno pasa (409 al otro).
    //    También da 409 si ya estaba cumplida o cancelada.
    if (!(await this.indicaciones.marcarCumplida(indicacion.id))) {
      throw new ConflictoDeConcurrenciaException('La indicación');
    }

    if (indicacion.tipo !== 'medicacion' || !indicacion.insumoId || !indicacion.cantidad) {
      return { indicacionId: indicacion.id, estado: 'cumplida' };
    }

    // 2. Descontar el stock. Si no alcanza, se revierte el paso 1 (compensación) y el error llega al cliente.
    let insumo: InsumoDescontado;
    try {
      insumo = await this.descontarInsumo.ejecutar(indicacion.insumoId, indicacion.cantidad);
    } catch (error) {
      await this.indicaciones.reabrir(indicacion.id);
      throw error;
    }

    // 3. Avisar a Facturación sin bloquear: el evento se emite y el flujo sigue.
    const payload: MedicacionAdministradaPayload = {
      indicacionId: indicacion.id,
      pacienteId: indicacion.pacienteId,
      insumoId: indicacion.insumoId,
      concepto: `Medicación: ${insumo.nombre}`,
      cantidad: indicacion.cantidad,
      precioUnitario: insumo.precioUnitario,
    };
    this.eventos.publicar(EVENTOS.MEDICACION_ADMINISTRADA, payload);

    return {
      indicacionId: indicacion.id,
      estado: 'cumplida',
      insumoDescontado: { nombre: insumo.nombre, cantidad: indicacion.cantidad },
    };
  }
}
