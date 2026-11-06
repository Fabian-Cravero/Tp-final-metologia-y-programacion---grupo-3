import { Cobertura } from '../entities/cobertura.entity';
import { Factura } from '../entities/factura.entity';
import { LineaFactura } from '../entities/linea-factura.entity';

export interface IFacturaRepository {
  /** Con su cobertura cargada. */
  findById(id: string): Promise<Factura | null>;
  /** La factura 'pendiente' (abierta) del paciente, si existe. */
  findAbiertaDePaciente(pacienteId: string): Promise<Factura | null>;
  listarDePaciente(pacienteId: string): Promise<Factura[]>;
  /** Si otra petición abrió una al mismo tiempo, devuelve esa (índice único parcial). */
  crear(pacienteId: string, coberturaId: string): Promise<Factura>;

  agregarLinea(facturaId: string, concepto: string, cantidad: number, precioUnitario: string): Promise<LineaFactura>;
  lineasDe(facturaId: string): Promise<LineaFactura[]>;
  actualizarTotales(facturaId: string, total: string, montoCubierto: string): Promise<void>;

  /** UPDATE ... WHERE estado = desde. false => otro cambió el estado antes. */
  cambiarEstado(id: string, desde: string, hasta: string): Promise<boolean>;

  findCobertura(id: string): Promise<Cobertura | null>;
  findCoberturaPorTipo(tipo: string): Promise<Cobertura | null>;
  listarCoberturas(): Promise<Cobertura[]>;
  /** Lanza DomainException si ya existe una cobertura con ese nombre. */
  crearCobertura(nombre: string, tipo: string, porcentaje: string): Promise<Cobertura>;
}

export const FACTURA_REPOSITORY = Symbol('FACTURA_REPOSITORY');
