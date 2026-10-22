import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
  TransicionInvalidaException,
} from '../../shared/exceptions/domain.exception';
import { Turno } from '../domain/entities/turno.entity';
import { type ITurnoRepository } from '../domain/repositories/turno-repository.interface';
import { AtenderTurnoUseCase } from './atender-turno.use-case';
import { CancelarTurnoUseCase } from './cancelar-turno.use-case';
import { ConfirmarTurnoUseCase } from './confirmar-turno.use-case';
import { RegistrarLlegadaUseCase } from './registrar-llegada.use-case';

function repo(estado: string | null, actualiza = true): ITurnoRepository {
  const turno = estado ? Object.assign(new Turno(), { id: 't1', estado, version: 1 }) : null;
  return {
    findById: async () => turno,
    crear: async () => new Turno(),
    actualizarEstado: async () => actualiza,
    listarPorMedicoYDia: async () => [],
  };
}

describe('Casos de uso de transición del turno', () => {
  it('confirmar: programado -> confirmado', async () => {
    await expect(new ConfirmarTurnoUseCase(repo('programado')).ejecutar('t1')).resolves.toBeDefined();
  });

  it('registrar llegada y atender siguen el camino feliz', async () => {
    await expect(new RegistrarLlegadaUseCase(repo('confirmado')).ejecutar('t1')).resolves.toBeDefined();
    await expect(new AtenderTurnoUseCase(repo('en_sala_espera')).ejecutar('t1')).resolves.toBeDefined();
  });

  it('cancelar un turno ya atendido es una transición inválida', async () => {
    await expect(new CancelarTurnoUseCase(repo('atendido')).ejecutar('t1')).rejects.toBeInstanceOf(
      TransicionInvalidaException,
    );
  });

  it('un turno inexistente responde recurso no encontrado', async () => {
    await expect(new ConfirmarTurnoUseCase(repo(null)).ejecutar('x')).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });

  it('si otra petición lo modificó antes (UPDATE sin filas) responde conflicto', async () => {
    await expect(new ConfirmarTurnoUseCase(repo('programado', false)).ejecutar('t1')).rejects.toBeInstanceOf(
      ConflictoDeConcurrenciaException,
    );
  });
});
