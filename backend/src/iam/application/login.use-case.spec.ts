import { CredencialesInvalidasException } from '../../shared/exceptions/domain.exception';
import { RolUsuario } from '../domain/enums/rol.enum';
import { LoginUseCase } from './login.use-case';
import { Usuario } from '../domain/entities/usuario.entity';
import {
  crearUsuario,
  hasherFalso,
  tokensFalsos,
  UsuariosEnMemoria,
} from './usuarios-en-memoria';

describe('LoginUseCase', () => {
  const crear = (usuarios: Usuario[]) =>
    new LoginUseCase(new UsuariosEnMemoria(usuarios), hasherFalso, tokensFalsos);

  it('devuelve token y datos del usuario con credenciales correctas', async () => {
    const r = await crear([crearUsuario()]).ejecutar({
      email: 'DRA@hospital.test',
      password: 'clave-segura',
    });

    expect(r.accessToken).toBe('token-de-dra@hospital.test');
    expect(r.usuario).toEqual({ id: 'u1', nombre: 'Dra. López', rol: RolUsuario.MEDICO });
  });

  it('nunca incluye el hash de la contraseña en el resultado', async () => {
    const r = await crear([crearUsuario()]).ejecutar({
      email: 'dra@hospital.test',
      password: 'clave-segura',
    });

    expect(JSON.stringify(r)).not.toContain('hash:');
  });

  it('rechaza una contraseña incorrecta', async () => {
    await expect(
      crear([crearUsuario()]).ejecutar({ email: 'dra@hospital.test', password: 'otra-clave' }),
    ).rejects.toBeInstanceOf(CredencialesInvalidasException);
  });

  it('rechaza un email que no existe', async () => {
    await expect(
      crear([]).ejecutar({ email: 'nadie@hospital.test', password: 'clave-segura' }),
    ).rejects.toBeInstanceOf(CredencialesInvalidasException);
  });

  it('rechaza a un usuario inactivo', async () => {
    await expect(
      crear([crearUsuario({ activo: false })]).ejecutar({
        email: 'dra@hospital.test',
        password: 'clave-segura',
      }),
    ).rejects.toBeInstanceOf(CredencialesInvalidasException);
  });
});
