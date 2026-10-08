import { Global, Injectable, Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_PUBLISHER, IEventPublisher } from './event-publisher.interface';

@Injectable()
export class EventEmitterPublisher implements IEventPublisher {
  constructor(private readonly emitter: EventEmitter2) {}

  /** emit() no espera a los listeners: la operación de origen no se bloquea. */
  publicar(evento: string, payload: object): void {
    this.emitter.emit(evento, payload);
  }
}

@Global()
@Module({
  providers: [{ provide: EVENT_PUBLISHER, useClass: EventEmitterPublisher }],
  exports: [EVENT_PUBLISHER],
})
export class EventosModule {}
