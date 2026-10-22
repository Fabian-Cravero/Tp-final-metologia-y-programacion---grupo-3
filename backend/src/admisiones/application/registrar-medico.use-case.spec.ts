import { QueryFailedError } from 'typeorm';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Medico } from '../domain/entities/medico.entity';
import { type IMedicoRepository } from '../domain/repositories/medico-repository.interface';
import { RegistrarMedicoUseCase } from './registrar-medico.use-case';

function repo(opciones: { existePorUsuario?: boolean; errorAlGuardar?: unknown } = {}): IMedicoRepository {
  return {
    findById: async () => null,
    findByUsuarioId: async () => (opciones.existePorUsuario ? new Medico() : null),
    listarActivos: async () => [],
    save: async (m: Medico) => {
      if (opciones.errorAlGuardar) throw opciones.errorAlGuardar;
      return m;
    },
  };
}

const comando = { matricula: ' MP-1 ', nombre: 'Luis', apellido: 'Gómez', especialidad: 'Clínica' };

describe('RegistrarMedicoUseCase', () => {
  it('da de alta un médico activo', async () => {
    const medico = await new RegistrarMedicoUseCase(repo()).ejecutar(comando);

    expect(medico.matricula).toBe('MP-1');
    expect(medico.activo).toBe(true);
    expect(medico.usuarioId).toBeNull();
  });

  it('rechaza un usuario ya asociado a otro médico', async () => {
    const uc = new RegistrarMedicoUseCase(repo({ existePorUsuario: true }));

    await expect(uc.ejecutar({ ...comando, usuarioId: 'u1' })).rejects.toBeInstanceOf(DomainException);
  });

  it('traduce la matrícula repetida (error 23505 de Postgres) a un error de dominio', async () => {
    const uc = new RegistrarMedicoUseCase(
      repo({ errorAlGuardar: new QueryFailedError('INSERT', [], Object.assign(new Error('duplicado'), { code: '23505' })) }),
    );

    await expect(uc.ejecutar(comando)).rejects.toThrow('matrícula');
  });
});
