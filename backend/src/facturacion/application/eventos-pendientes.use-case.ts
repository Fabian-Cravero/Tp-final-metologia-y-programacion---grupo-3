import { Inject, Injectable } from '@nestjs/common';
import { EventoDominio } from '../domain/entities/evento-dominio.entity';
import {
  EVENTO_DOMINIO_REPOSITORY,
  type IEventoDominioRepository,
} from '../domain/repositories/evento-dominio-repository.interface';

/** Trazabilidad del outbox: eventos que llegaron pero no se pudieron facturar. */
@Injectable()
export class EventosPendientesUseCase {
  constructor(@Inject(EVENTO_DOMINIO_REPOSITORY) private readonly eventos: IEventoDominioRepository) {}

  ejecutar(): Promise<EventoDominio[]> {
    return this.eventos.listarPendientes();
  }
}
