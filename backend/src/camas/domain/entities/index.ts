import { Cama } from './cama.entity';
import { AsignacionCama } from './asignacion-cama.entity';
import { Insumo } from './insumo.entity';
import { StockInsumo } from './stock-insumo.entity';

export { Cama, AsignacionCama, Insumo, StockInsumo };

/** Entidades de este módulo: se registran en TypeOrmModule.forFeature(). */
export const entidadesCamas = [Cama, AsignacionCama, Insumo, StockInsumo];
