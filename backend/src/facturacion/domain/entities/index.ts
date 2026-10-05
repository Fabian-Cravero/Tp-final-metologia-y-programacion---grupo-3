import { Cobertura } from './cobertura.entity';
import { Factura } from './factura.entity';
import { LineaFactura } from './linea-factura.entity';
import { EventoDominio } from './evento-dominio.entity';

export { Cobertura, Factura, LineaFactura, EventoDominio };

/** Entidades de este módulo: se registran en TypeOrmModule.forFeature(). */
export const entidadesFacturacion = [Cobertura, Factura, LineaFactura, EventoDominio];
