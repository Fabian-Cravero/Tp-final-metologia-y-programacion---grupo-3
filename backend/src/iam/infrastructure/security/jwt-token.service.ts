import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService, PayloadToken } from '../../domain/services/token-service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwt: JwtService) {}

  firmar(payload: PayloadToken): Promise<string> {
    return this.jwt.signAsync(payload);
  }
}
