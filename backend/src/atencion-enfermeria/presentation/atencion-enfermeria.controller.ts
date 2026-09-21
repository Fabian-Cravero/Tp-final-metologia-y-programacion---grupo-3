import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('atencion-enfermeria')
@Controller('atencion-enfermeria')
export class AtencionEnfermeriaController {
  @Get('ping')
  ping() {
    return { modulo: 'atencion-enfermeria', estado: 'estructura lista, falta implementar' };
  }
}
