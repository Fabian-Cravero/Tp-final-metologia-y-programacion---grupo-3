import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { BuscarPacientesUseCase } from '../application/buscar-pacientes.use-case';
import { RegistrarPacienteUseCase } from '../application/registrar-paciente.use-case';
import { RegistrarPacienteDto } from './dto/registrar-paciente.dto';

@ApiTags('admisiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admisiones/pacientes')
export class PacientesController {
  constructor(
    private readonly registrar: RegistrarPacienteUseCase,
    private readonly buscar: BuscarPacientesUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  crear(@Body() dto: RegistrarPacienteDto) {
    return this.registrar.ejecutar(dto);
  }

  @Get()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.MEDICO, RolUsuario.ENFERMERO, RolUsuario.ADMIN)
  listar(@Query('q') q = '') {
    return this.buscar.ejecutar(q);
  }
}
