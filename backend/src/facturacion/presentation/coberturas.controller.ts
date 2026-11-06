import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CoberturasUseCase } from '../application/coberturas.use-case';
import { AsignarCoberturaDto, CrearCoberturaDto } from './dto/facturacion.dto';

@ApiTags('facturacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturacion')
export class CoberturasController {
  constructor(private readonly coberturas: CoberturasUseCase) {}

  @Get('coberturas')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  listar() {
    return this.coberturas.listar();
  }

  @Post('coberturas')
  @Roles(RolUsuario.ADMIN)
  crear(@Body() dto: CrearCoberturaDto) {
    return this.coberturas.crear({
      nombre: dto.nombre,
      tipo: dto.tipo,
      porcentajeCobertura: dto.porcentajeCobertura,
    });
  }

  @Patch('pacientes/:pacienteId/cobertura')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  asignar(@Param('pacienteId', ParseUUIDPipe) pacienteId: string, @Body() dto: AsignarCoberturaDto) {
    return this.coberturas.asignarAPaciente(pacienteId, dto.coberturaId);
  }
}
