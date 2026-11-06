import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTOS, type MedicacionAdministradaPayload } from '../../../shared/events/eventos';
import { RegistrarCargoUseCase } from '../../application/registrar-cargo.use-case';
import {
  EVENTO_DOMINIO_REPOSITORY,
  type IEventoDominioRepository,
} from '../../domain/repositories/evento-dominio-repository.interface';

/**
 * Observer: Facturación se entera de cada medicación administrada sin que Atención y Enfermería
 * sepa que existe Facturación. Orden (outbox):
 *   1. si ya se procesó, salir (no se cobra dos veces);
 *   2. guardar el evento como no procesado;
 *   3. registrar el cargo;
 *   4. marcarlo procesado.
 * Si el paso 3 falla, la fila queda con procesado = false: se sabe qué evento no se facturó.
 */
@Injectable()
export class MedicacionAdministradaListener {
  private readonly logger = new Logger(MedicacionAdministradaListener.name);

  constructor(
    private readonly registrarCargo: RegistrarCargoUseCase,
    @Inject(EVENTO_DOMINIO_REPOSITORY) private readonly eventos: IEventoDominioRepository,
  ) {}

  @OnEvent(EVENTOS.MEDICACION_ADMINISTRADA)
  async manejar(payload: MedicacionAdministradaPayload): Promise<void> {
    if (await this.eventos.existeProcesado(EVENTOS.MEDICACION_ADMINISTRADA, payload.indicacionId)) {
      return;
    }

    const evento = await this.eventos.registrar(EVENTOS.MEDICACION_ADMINISTRADA, { ...payload });

    try {
      const factura = await this.registrarCargo.ejecutar({
        pacienteId: payload.pacienteId,
        concepto: payload.concepto,
        cantidad: payload.cantidad,
        precioUnitario: payload.precioUnitario,
      });
      await this.eventos.marcarProcesado(evento.id);
      this.logger.log(`Cargo facturado: ${payload.concepto} x${payload.cantidad} (factura ${factura.id})`);
    } catch (error) {
      // No se propaga: el módulo que emitió el evento no tiene que fallar por Facturación.
      this.logger.error(`No se pudo facturar el evento ${evento.id}: ${(error as Error).message}`);
    }
  }
}
