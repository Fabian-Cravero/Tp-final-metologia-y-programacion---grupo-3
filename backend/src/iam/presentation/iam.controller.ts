import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * TODO (Fase 1): AuthController real — POST /iam/login, POST /iam/registro,
 * usando LoginUseCase + estrategia JWT de Passport. Este endpoint es solo
 * para confirmar que el módulo está wireado en app.module.ts.
 */
@ApiTags('iam')
@Controller('iam')
export class IamController {
  @Get('ping')
  ping() {
    return { modulo: 'iam', estado: 'estructura lista, falta implementar login' };
  }
}
