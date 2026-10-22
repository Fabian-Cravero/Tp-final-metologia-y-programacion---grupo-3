import { ConflictoDeConcurrenciaException } from '../../shared/exceptions/domain.exception';
import { Medico } from '../domain/entities/medico.entity';
import { Paciente } from '../domain/entities/paciente.entity';
import { Turno } from '../domain/entities/turno.entity';
import { type ITurnoRepository, type NuevoTurno } from '../domain/repositories/turno-repository.interface';
import { ReservarTurnoUseCase } from './reservar-turno.use-case';

/** Simula el índice único (medico + horario) de la base. */
class TurnosEnMemoria implements ITurnoRepository {
  private readonly tomados = new Set<string>();

  async findById() { return null; }
  async actualizarEstado() { return true; }
  async listarPorMedicoYDia() { return []; }

  async crear(d: NuevoTurno): Promise<Turno> {
    const clave = `${d.medicoId}|${d.fechaHora.toISOString()}`;
    if (this.tomados.has(clave)) throw new ConflictoDeConcurrenciaException('El horario');
    this.tomados.add(clave);
    return Object.assign(new Turno(), { id: clave });
  }
}

describe('ReservarTurnoUseCase', () => {
  const medico = Object.assign(new Medico(), { id: 'm1', activo: true });
  const paciente = Object.assign(new Paciente(), { id: 'p1' });
  const manana = new Date(Date.now() + 24 * 3600 * 1000);

  const crear = () =>
    new ReservarTurnoUseCase(
      new TurnosEnMemoria(),
      { findById: async () => paciente } as never,
      { findById: async () => medico } as never,
    );

  it('la segunda reserva del mismo horario responde conflicto', async () => {
    const useCase = crear();
    const cmd = { pacienteId: 'p1', medicoId: 'm1', fechaHora: manana };

    await expect(useCase.ejecutar(cmd)).resolves.toBeDefined();
    await expect(useCase.ejecutar(cmd)).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });

  it('no permite reservar en el pasado', async () => {
    await expect(
      crear().ejecutar({ pacienteId: 'p1', medicoId: 'm1', fechaHora: new Date(Date.now() - 1000) }),
    ).rejects.toThrow('pasado');
  });
});
