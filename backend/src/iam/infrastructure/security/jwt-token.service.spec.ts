import { JwtService } from '@nestjs/jwt';
import { RolUsuario } from '../../domain/enums/rol.enum';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  it('firma el payload y devuelve el token que genera JwtService', async () => {
    const signAsync = jest.fn().mockResolvedValue('token-firmado');
    const service = new JwtTokenService({ signAsync } as unknown as JwtService);
    const payload = { sub: 'u1', email: 'dra@hospital.test', rol: RolUsuario.MEDICO };

    await expect(service.firmar(payload)).resolves.toBe('token-firmado');
    expect(signAsync).toHaveBeenCalledWith(payload);
  });
});
