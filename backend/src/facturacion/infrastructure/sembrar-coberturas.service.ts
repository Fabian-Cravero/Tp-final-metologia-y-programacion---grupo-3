import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { FACTURA_REPOSITORY, type IFacturaRepository } from '../domain/repositories/factura-repository.interface';

/** Sin coberturas no se puede facturar: se crean al arrancar si la tabla está vacía. */
@Injectable()
export class SembrarCoberturasService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SembrarCoberturasService.name);

  constructor(@Inject(FACTURA_REPOSITORY) private readonly facturas: IFacturaRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    if ((await this.facturas.listarCoberturas()).length > 0) return;

    await this.facturas.crearCobertura('Particular', 'particular', '0');
    await this.facturas.crearCobertura('Obra social pública', 'publica', '100');
    await this.facturas.crearCobertura('Prepaga (ejemplo 70%)', 'prepaga', '70');
    this.logger.log('Coberturas iniciales creadas: Particular, Obra social pública, Prepaga 70%');
  }
}
