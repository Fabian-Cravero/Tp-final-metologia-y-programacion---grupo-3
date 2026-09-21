import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('camas')
@Controller('camas')
export class CamasController {
  @Get('ping')
  ping() {
    return { modulo: 'camas', estado: 'estructura lista, falta implementar' };
  }
}
