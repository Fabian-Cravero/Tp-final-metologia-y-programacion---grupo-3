import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('historia-clinica')
@Controller('historia-clinica')
export class HistoriaClinicaController {
  @Get('ping')
  ping() {
    return { modulo: 'historia-clinica', estado: 'estructura lista, falta implementar' };
  }
}
