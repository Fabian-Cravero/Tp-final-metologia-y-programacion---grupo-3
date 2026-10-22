import { Body, Controller, Get, HttpCode, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { AgregarAColaUseCase } from '../application/agregar-a-cola.use-case';
import { LlamarSiguienteUseCase } from '../application/llamar-siguiente.use-case';
import { ListarColaUseCase } from '../application/listar-cola.use-case';
import { AgregarColaDto } from './dto/agregar-cola.dto';

@ApiTags('admisiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admisiones/cola')
export class ColaController {
  constructor(
    private readonly agregar: AgregarAColaUseCase,
    private readonly listarCola: ListarColaUseCase,
    private readonly llamar: LlamarSiguienteUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ENFERMERO, RolUsuario.MEDICO, RolUsuario.ADMIN)
  agregarACola(@Body() dto: AgregarColaDto) {
    return this.agregar.ejecutar(dto);
  }

  @Get()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ENFERMERO, RolUsuario.MEDICO, RolUsuario.ADMIN)
  listar(@Query('medicoId', ParseUUIDPipe) medicoId: string) {
    return this.listarCola.ejecutar(medicoId);
  }

  @Post('siguiente')
  @HttpCode(200)
  @Roles(RolUsuario.MEDICO)
  siguiente(@Query('medicoId', ParseUUIDPipe) medicoId: string) {
    return this.llamar.ejecutar(medicoId);
  }
}
