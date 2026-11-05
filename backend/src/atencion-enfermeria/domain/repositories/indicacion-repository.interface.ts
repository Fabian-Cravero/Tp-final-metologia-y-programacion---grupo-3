import { IndicacionMedica } from '../entities/indicacion-medica.entity';

export interface NuevaIndicacion {
  pacienteId: string;
  medicoId: string;
  tipo: string;
  descripcion: string;
  insumoId?: string;
  cantidad?: number;
}

export interface IIndicacionRepository {
  crear(datos: NuevaIndicacion): Promise<IndicacionMedica>;
  findById(id: string): Promise<IndicacionMedica | null>;
  listarPendientes(pacienteId: string): Promise<IndicacionMedica[]>;
  /** UPDATE ... WHERE estado = 'pendiente'. false => otro enfermero ya la cumplió o fue cancelada. */
  marcarCumplida(id: string): Promise<boolean>;
  /** UPDATE ... WHERE estado = 'pendiente'. false => ya estaba cumplida o cancelada. */
  cancelar(id: string): Promise<boolean>;
  /** Compensación: vuelve a 'pendiente' si falló el descuento de stock. */
  reabrir(id: string): Promise<void>;
}

export const INDICACION_REPOSITORY = Symbol('INDICACION_REPOSITORY');
