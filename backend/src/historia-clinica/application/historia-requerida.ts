import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { HistoriaClinica } from '../domain/entities/historia-clinica.entity';
import { type IHistoriaClinicaRepository } from '../domain/repositories/historia-clinica-repository.interface';

export async function historiaRequerida(
  repo: IHistoriaClinicaRepository,
  pacienteId: string,
): Promise<HistoriaClinica> {
  const historia = await repo.findByPaciente(pacienteId);
  if (!historia) throw new RecursoNoEncontradoException('Historia clínica');
  return historia;
}
