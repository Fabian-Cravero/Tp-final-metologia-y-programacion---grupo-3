import { DomainException } from '../../shared/exceptions/domain.exception';
import { RolUsuario } from '../domain/enums/rol.enum';
import { RegistrarUsuarioUseCase } from './registrar-usuario.use-case';
import { crearUsuario, hasherFalso, UsuariosEnMemoria } from './usuarios-en-memoria';

describe('RegistrarUsuarioUseCase', () => {
  it('guarda el usuario con el hash y no con la contraseña en claro', async () => {
    const repo = new UsuariosEnMemoria();
    const useCase = new RegistrarUsuarioUseCase(repo, hasherFalso);

    const u = await useCase.ejecutar({
      email: 'nuevo@hospital.test',
      password: 'clave-segura',
      nombre: 'Nuevo',
      rol: RolUsuario.ENFERMERO,
    });

    expect(u.passwordHash).toBe('hash:clave-segura');
    expect(u.passwordHash).not.toBe('clave-segura');
    expect(u.rol).toBe(RolUsuario.ENFERMERO);
    expect(u.activo).toBe(true);
    expect(repo.guardados).toHaveLength(1);
  });

  it('normaliza el email (minúsculas y sin espacios) y recorta el nombre', async () => {
    const useCase = new RegistrarUsuarioUseCase(new UsuariosEnMemoria(), hasherFalso);

    const u = await useCase.ejecutar({
      email: '  Nuevo@Hospital.TEST ',
      password: 'clave-segura',
      nombre: '  Nuevo  ',
      rol: RolUsuario.PACIENTE,
    });

    expect(u.email).toBe('nuevo@hospital.test');
    expect(u.nombre).toBe('Nuevo');
  });

  it('rechaza un email que ya existe, sin importar mayúsculas', async () => {
    const repo = new UsuariosEnMemoria([crearUsuario({ email: 'dra@hospital.test' })]);
    const useCase = new RegistrarUsuarioUseCase(repo, hasherFalso);

    await expect(
      useCase.ejecutar({
        email: 'DRA@hospital.test',
        password: 'clave-segura',
        nombre: 'Otra',
        rol: RolUsuario.MEDICO,
      }),
    ).rejects.toBeInstanceOf(DomainException);
    expect(repo.guardados).toHaveLength(0);
  });
});
