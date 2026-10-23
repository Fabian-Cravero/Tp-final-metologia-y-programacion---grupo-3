import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AsignarCamaUseCase } from '../application/asignar-cama.use-case';
import { BloquearCamaUseCase } from '../application/bloquear-cama.use-case';
import { ConfirmarLimpiezaUseCase } from '../application/confirmar-limpieza.use-case';
import { CrearCamaUseCase } from '../application/crear-cama.use-case';
import { HabilitarCamaUseCase } from '../application/habilitar-cama.use-case';
import { LiberarCamaUseCase } from '../application/liberar-cama.use-case';
import { ObtenerMapaCamasUseCase } from '../application/obtener-mapa-camas.use-case';
import { AsignarCamaDto } from './dto/asignar-cama.dto';
import { CrearCamaDto } from './dto/crear-cama.dto';

@ApiTags('camas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('camas')
export class GestionCamasController {
  constructor(
    private readonly mapa: ObtenerMapaCamasUseCase,
    private readonly crear: CrearCamaUseCase,
    private readonly asignar: AsignarCamaUseCase,
    private readonly liberar: LiberarCamaUseCase,
    private readonly limpieza: ConfirmarLimpiezaUseCase,
    private readonly bloquear: BloquearCamaUseCase,
    private readonly habilitar: HabilitarCamaUseCase,
  ) {}

  @Get('mapa')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA, RolUsuario.MEDICO, RolUsuario.ENFERMERO)
  verMapa() {
    return this.mapa.ejecutar();
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  crearCama(@Body() dto: CrearCamaDto) {
    return this.crear.ejecutar(dto.codigo, dto.sector);
  }

  @Post(':id/asignar')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  asignarCama(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AsignarCamaDto) {
    return this.asignar.ejecutar(id, dto.pacienteId);
  }

  @Patch(':id/liberar')
  @Roles(RolUsuario.ADMIN, RolUsuario.MEDICO, RolUsuario.ENFERMERO)
  liberarCama(@Param('id', ParseUUIDPipe) id: string) {
    return this.liberar.ejecutar(id);
  }

  @Patch(':id/limpieza-confirmada')
  @Roles(RolUsuario.ADMIN, RolUsuario.ENFERMERO)
  confirmarLimpieza(@Param('id', ParseUUIDPipe) id: string) {
    return this.limpieza.ejecutar(id);
  }

  @Patch(':id/bloquear')
  @Roles(RolUsuario.ADMIN)
  bloquearCama(@Param('id', ParseUUIDPipe) id: string) {
    return this.bloquear.ejecutar(id);
  }

  @Patch(':id/habilitar')
  @Roles(RolUsuario.ADMIN)
  habilitarCama(@Param('id', ParseUUIDPipe) id: string) {
    return this.habilitar.ejecutar(id);
  }
}
