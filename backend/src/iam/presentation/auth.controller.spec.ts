import { LoginUseCase } from '../application/login.use-case';
import { RegistrarUsuarioUseCase } from '../application/registrar-usuario.use-case';
import { crearUsuario } from '../application/usuarios-en-memoria';
import { RolUsuario } from '../domain/enums/rol.enum';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const ejecutarLogin = jest.fn();
  const ejecutarRegistro = jest.fn();
  const controller = new AuthController(
    { ejecutar: ejecutarLogin } as unknown as LoginUseCase,
    { ejecutar: ejecutarRegistro } as unknown as RegistrarUsuarioUseCase,
  );

  beforeEach(() => jest.resetAllMocks());

  it('login delega en el caso de uso y devuelve su resultado', async () => {
    const resultado = { accessToken: 't', usuario: { id: 'u1', nombre: 'A', rol: RolUsuario.ADMIN } };
    ejecutarLogin.mockResolvedValue(resultado);

    await expect(
      controller.login({ email: 'a@hospital.test', password: 'clave-segura' }),
    ).resolves.toBe(resultado);
  });

  it('el autoregistro siempre crea un paciente, aunque el body intente elegir otro rol', async () => {
    ejecutarRegistro.mockResolvedValue(crearUsuario({ rol: RolUsuario.PACIENTE }));

    await controller.registro({
      email: 'p@hospital.test',
      password: 'clave-segura',
      nombre: 'Paciente',
      rol: RolUsuario.ADMIN,
    } as never);

    expect(ejecutarRegistro).toHaveBeenCalledWith(
      expect.objectContaining({ rol: RolUsuario.PACIENTE }),
    );
  });

  it('las respuestas no incluyen el hash de la contraseña', async () => {
    ejecutarRegistro.mockResolvedValue(crearUsuario());

    const respuesta = await controller.crearUsuario({
      email: 'dra@hospital.test',
      password: 'clave-segura',
      nombre: 'Dra. López',
      rol: RolUsuario.MEDICO,
    });

    expect(respuesta).toEqual({
      id: 'u1',
      email: 'dra@hospital.test',
      nombre: 'Dra. López',
      rol: RolUsuario.MEDICO,
      activo: true,
    });
    expect(JSON.stringify(respuesta)).not.toContain('hash');
  });

  it('yo devuelve el usuario del token', () => {
    const usuario = { id: 'u1', email: 'dra@hospital.test', rol: RolUsuario.MEDICO };

    expect(controller.yo(usuario)).toBe(usuario);
  });
});
