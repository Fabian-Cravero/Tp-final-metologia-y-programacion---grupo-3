export interface IEventPublisher {
  publicar(evento: string, payload: object): void;
}

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');
