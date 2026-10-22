import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { ListarMedicosUseCase } from '../application/listar-medicos.use-case';
import { RegistrarMedicoUseCase } from '../application/registrar-medico.use-case';
import { RegistrarMedicoDto } from './dto/registrar-medico.dto';

@ApiTags('admisiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admisiones/medicos')
export class MedicosController {
  constructor(
    private readonly registrar: RegistrarMedicoUseCase,
    private readonly listarActivos: ListarMedicosUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.ADMIN)
  crear(@Body() dto: RegistrarMedicoDto) {
    return this.registrar.ejecutar(dto);
  }

  @Get()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.MEDICO, RolUsuario.ENFERMERO, RolUsuario.ADMIN)
  listar() {
    return this.listarActivos.ejecutar();
  }
}
