import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Factura } from '../domain/entities/factura.entity';
import { type AccionFactura, siguienteEstadoFactura } from '../domain/factura-workflow';
import { type IFacturaRepository } from '../domain/repositories/factura-repository.interface';

/** Molde de emitir, pagar y anular: igual que las transiciones de turnos y camas. */
export abstract class CambiarEstadoFacturaBase {
  protected abstract readonly accion: AccionFactura;

  constructor(protected readonly facturas: IFacturaRepository) {}

  async ejecutar(facturaId: string): Promise<Factura> {
    const factura = await this.facturas.findById(facturaId);
    if (!factura) throw new RecursoNoEncontradoException('Factura');

    const nuevo = siguienteEstadoFactura(factura.estado, this.accion); // 422 si no corresponde

    if (this.accion === 'emitir' && (await this.facturas.lineasDe(factura.id)).length === 0) {
      throw new DomainException('No se puede emitir una factura sin líneas');
    }

    // UPDATE ... WHERE estado = el leído: si otra petición lo cambió antes, 409.
    if (!(await this.facturas.cambiarEstado(factura.id, factura.estado, nuevo))) {
      throw new ConflictoDeConcurrenciaException('La factura');
    }
    return (await this.facturas.findById(factura.id)) ?? factura;
  }
}
