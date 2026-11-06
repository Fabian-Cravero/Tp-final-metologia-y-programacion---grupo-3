import { Inject, Injectable } from '@nestjs/common';
import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { Factura } from '../domain/entities/factura.entity';
import { LineaFactura } from '../domain/entities/linea-factura.entity';
import {
  FACTURA_REPOSITORY,
  type IFacturaRepository,
} from '../domain/repositories/factura-repository.interface';

export interface FacturaConLineas {
  factura: Factura;
  lineas: LineaFactura[];
}

@Injectable()
export class ConsultarFacturasUseCase {
  constructor(@Inject(FACTURA_REPOSITORY) private readonly facturas: IFacturaRepository) {}

  async detalle(facturaId: string): Promise<FacturaConLineas> {
    const factura = await this.facturas.findById(facturaId);
    if (!factura) throw new RecursoNoEncontradoException('Factura');
    return { factura, lineas: await this.facturas.lineasDe(factura.id) };
  }

  delPaciente(pacienteId: string): Promise<Factura[]> {
    return this.facturas.listarDePaciente(pacienteId);
  }
}
