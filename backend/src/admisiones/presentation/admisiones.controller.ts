import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admisiones')
@Controller('admisiones')
export class AdmisionesController {
  @Get('ping')
  ping() {
    return { modulo: 'admisiones', estado: 'estructura lista, falta implementar' };
  }
}
