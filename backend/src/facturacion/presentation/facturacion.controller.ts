import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('facturacion')
@Controller('facturacion')
export class FacturacionController {
  @Get('ping')
  ping() {
    return { modulo: 'facturacion', estado: 'estructura lista, falta implementar' };
  }
}
