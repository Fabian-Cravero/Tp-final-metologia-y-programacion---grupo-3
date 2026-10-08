import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige un JWT válido. La estrategia 'jwt' la registra IamModule. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
