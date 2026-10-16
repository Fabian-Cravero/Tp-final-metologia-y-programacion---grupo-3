import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UsuarioAutenticado } from '../../../shared/decorators/usuario-actual.decorator';
import { PayloadToken } from '../../domain/services/token-service.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Lo que devuelve acá queda disponible como request.user. */
  validate(payload: PayloadToken): UsuarioAutenticado {
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  }
}
