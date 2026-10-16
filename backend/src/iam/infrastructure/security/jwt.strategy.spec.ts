import { ConfigService } from '@nestjs/config';
import { RolUsuario } from '../../domain/enums/rol.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = { getOrThrow: () => 'secreto-de-prueba' } as unknown as ConfigService;

  it('convierte el payload del token en el usuario autenticado', () => {
    const strategy = new JwtStrategy(config);

    expect(
      strategy.validate({ sub: 'u1', email: 'dra@hospital.test', rol: RolUsuario.MEDICO }),
    ).toEqual({ id: 'u1', email: 'dra@hospital.test', rol: RolUsuario.MEDICO });
  });

  it('no arranca si falta JWT_SECRET', () => {
    const sinSecreto = {
      getOrThrow: () => {
        throw new Error('JWT_SECRET no definido');
      },
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(sinSecreto)).toThrow('JWT_SECRET');
  });
});
