import { HistoriaClinica } from './historia-clinica.entity';
import { Alergia } from './alergia.entity';
import { AntecedenteFamiliar } from './antecedente-familiar.entity';
import { Evolucion } from './evolucion.entity';

export { HistoriaClinica, Alergia, AntecedenteFamiliar, Evolucion };

/** Entidades de este módulo: se registran en TypeOrmModule.forFeature(). */
export const entidadesHistoriaClinica = [HistoriaClinica, Alergia, AntecedenteFamiliar, Evolucion];
