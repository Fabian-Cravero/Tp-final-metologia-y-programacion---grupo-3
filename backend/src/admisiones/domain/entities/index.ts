import { Paciente } from './paciente.entity';
import { Medico } from './medico.entity';
import { Turno } from './turno.entity';
import { ColaEntreturno } from './cola-entreturno.entity';
import { ListaEspera } from './lista-espera.entity';

export { Paciente, Medico, Turno, ColaEntreturno, ListaEspera };

/** Entidades de este módulo: se registran en TypeOrmModule.forFeature(). */
export const entidadesAdmisiones = [Paciente, Medico, Turno, ColaEntreturno, ListaEspera];
