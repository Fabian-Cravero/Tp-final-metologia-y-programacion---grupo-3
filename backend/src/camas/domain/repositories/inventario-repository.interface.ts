import { Insumo } from '../entities/insumo.entity';

export interface InsumoConStock {
  id: string;
  nombre: string;
  unidad: string;
  umbralMinimo: number;
  precioUnitario: string;
  /** Suma de todas las ubicaciones. */
  stockTotal: number;
}

export interface IInventarioRepository {
  findInsumo(id: string): Promise<Insumo | null>;
  crearInsumo(datos: { nombre: string; unidad: string; umbralMinimo: number; precioUnitario: string }): Promise<Insumo>;
  ingresarStock(insumoId: string, cantidad: number, ubicacion?: string): Promise<void>;
  /** Resta de forma atómica. false => no hay ninguna ubicación con stock suficiente. */
  descontar(insumoId: string, cantidad: number): Promise<boolean>;
  stockTotal(insumoId: string): Promise<number>;
  /** Todos los insumos con su stock total, ordenados por nombre. */
  listarInsumos(): Promise<InsumoConStock[]>;
}

export const INVENTARIO_REPOSITORY = Symbol('INVENTARIO_REPOSITORY');
