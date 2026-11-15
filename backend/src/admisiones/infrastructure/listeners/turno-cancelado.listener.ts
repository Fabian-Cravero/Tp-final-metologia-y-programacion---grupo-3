import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTOS, type TurnoCanceladoPayload } from '../../../shared/events/eventos';
import { PromoverDesdeListaEsperaUseCase } from '../../application/promover-desde-lista-espera.use-case';

/**
 * Observer (HU 1.3): cada vez que se cancela un turno, intenta dárselo al primero de la lista de espera.
 * El caso de uso que cancela no sabe que esto existe.
 */
@Injectable()
export class TurnoCanceladoListener {
  private readonly logger = new Logger(TurnoCanceladoListener.name);

  constructor(private readonly promover: PromoverDesdeListaEsperaUseCase) {}

  @OnEvent(EVENTOS.TURNO_CANCELADO)
  async manejar(p: TurnoCanceladoPayload): Promise<void> {
    try {
      const promovido = await this.promover.ejecutar({
        medicoId: p.medicoId,
        fechaHora: new Date(p.fechaHora),
        duracionMinutos: p.duracionMinutos,
      });
      if (promovido) {
        // Alerta para recepción: en el frontend aparece en la lista de espera hasta que marquen "Ya avisé".
        const hora = new Date(p.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
        this.logger.warn(
          `Lista de espera: avisar a ${promovido.paciente.apellido}, ${promovido.paciente.nombre}. Nuevo turno a las ${hora}`,
        );
      }
    } catch (error) {
      // No se propaga: la cancelación ya quedó hecha aunque falle la promoción.
      this.logger.error(`No se pudo promover desde la lista de espera: ${(error as Error).message}`);
    }
  }
}
