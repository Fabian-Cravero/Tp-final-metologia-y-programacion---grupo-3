import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTOS, type StockBajoUmbralPayload } from '../../shared/events/eventos';

/** Observer: reacciona al evento sin que el descuento de stock lo conozca. */
@Injectable()
export class AlertaStockListener {
  private readonly logger = new Logger(AlertaStockListener.name);

  @OnEvent(EVENTOS.STOCK_BAJO_UMBRAL)
  manejar(p: StockBajoUmbralPayload) {
    this.logger.warn(`Stock bajo: ${p.nombre} (${p.stockTotal} < mínimo ${p.umbralMinimo})`);
  }
}
