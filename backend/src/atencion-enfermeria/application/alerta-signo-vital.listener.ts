import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTOS, type SignoVitalFueraDeRangoPayload } from '../../shared/events/eventos';

/** Observer: muestra la alerta en la consola del backend sin que el registro lo conozca. */
@Injectable()
export class AlertaSignoVitalListener {
  private readonly logger = new Logger(AlertaSignoVitalListener.name);

  @OnEvent(EVENTOS.SIGNO_VITAL_FUERA_DE_RANGO)
  manejar(p: SignoVitalFueraDeRangoPayload) {
    const mensaje = `Signo vital ${p.severidad.toUpperCase()}: ${p.tipo} = ${p.valor} (paciente ${p.pacienteId})`;
    if (p.severidad === 'critico') this.logger.error(mensaje);
    else this.logger.warn(mensaje);
  }
}
