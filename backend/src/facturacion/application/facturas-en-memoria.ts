import { Cobertura } from '../domain/entities/cobertura.entity';
import { Factura } from '../domain/entities/factura.entity';
import { LineaFactura } from '../domain/entities/linea-factura.entity';
import { type IFacturaRepository } from '../domain/repositories/factura-repository.interface';

/** Repositorio en memoria para probar los casos de uso de Facturación sin base de datos. */
export class FacturasEnMemoria implements IFacturaRepository {
  readonly facturas: Factura[] = [];
  readonly lineas: { facturaId: string; linea: LineaFactura }[] = [];
  readonly coberturas: Cobertura[] = [];

  agregarCobertura(id: string, tipo: string, porcentaje: string, nombre = tipo): Cobertura {
    const c = Object.assign(new Cobertura(), { id, nombre, tipo, porcentajeCobertura: porcentaje });
    this.coberturas.push(c);
    return c;
  }

  async findById(id: string) { return this.facturas.find((f) => f.id === id) ?? null; }
  async findAbiertaDePaciente(pacienteId: string) {
    return this.facturas.find((f) => f.pacienteId === pacienteId && f.estado === 'pendiente') ?? null;
  }
  async listarDePaciente(pacienteId: string) { return this.facturas.filter((f) => f.pacienteId === pacienteId); }

  async crear(pacienteId: string, coberturaId: string) {
    const cobertura = this.coberturas.find((c) => c.id === coberturaId)!;
    const factura = Object.assign(new Factura(), {
      id: `f${this.facturas.length + 1}`,
      pacienteId,
      cobertura,
      total: '0.00',
      montoCubierto: '0.00',
      estado: 'pendiente',
      emitidaEn: new Date(),
    });
    this.facturas.push(factura);
    return factura;
  }

  async agregarLinea(facturaId: string, concepto: string, cantidad: number, precioUnitario: string) {
    const linea = Object.assign(new LineaFactura(), { id: `l${this.lineas.length + 1}`, concepto, cantidad, precioUnitario });
    this.lineas.push({ facturaId, linea });
    return linea;
  }

  async lineasDe(facturaId: string) { return this.lineas.filter((x) => x.facturaId === facturaId).map((x) => x.linea); }

  async actualizarTotales(facturaId: string, total: string, montoCubierto: string) {
    const f = this.facturas.find((x) => x.id === facturaId);
    if (f) Object.assign(f, { total, montoCubierto });
  }

  async cambiarEstado(id: string, desde: string, hasta: string) {
    const f = this.facturas.find((x) => x.id === id);
    if (!f || f.estado !== desde) return false;
    f.estado = hasta;
    return true;
  }

  async findCobertura(id: string) { return this.coberturas.find((c) => c.id === id) ?? null; }
  async findCoberturaPorTipo(tipo: string) { return this.coberturas.find((c) => c.tipo === tipo) ?? null; }
  async listarCoberturas() { return this.coberturas; }
  async crearCobertura(nombre: string, tipo: string, porcentaje: string) {
    return this.agregarCobertura(`c${this.coberturas.length + 1}`, tipo, porcentaje, nombre);
  }
}
