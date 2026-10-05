import { Paciente } from './paciente.entity';
import { Medico } from './medico.entity';
import { Turno } from './turno.entity';
import { ColaEntreturno } from './cola-entreturno.entity';

export { Paciente, Medico, Turno, ColaEntreturno };

/** Entidades de este módulo: se registran en TypeOrmModule.forFeature(). */
export const entidadesAdmisiones = [Paciente, Medico, Turno, ColaEntreturno];
