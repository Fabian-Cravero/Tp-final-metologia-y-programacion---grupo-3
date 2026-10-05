import { SignoVital } from './signo-vital.entity';
import { IndicacionMedica } from './indicacion-medica.entity';
import { ProtocoloCuidado } from './protocolo-cuidado.entity';
import { TareaProtocolo } from './tarea-protocolo.entity';

export { SignoVital, IndicacionMedica, ProtocoloCuidado, TareaProtocolo };

/** Entidades de este módulo: se registran en TypeOrmModule.forFeature(). */
export const entidadesAtencionEnfermeria = [SignoVital, IndicacionMedica, ProtocoloCuidado, TareaProtocolo];
