import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UsuarioActual, type UsuarioAutenticado } from '../../shared/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AbrirHistoriaClinicaUseCase } from '../application/abrir-historia-clinica.use-case';
import { AgregarEvolucionUseCase } from '../application/agregar-evolucion.use-case';
import { ObtenerHistoriaCompletaUseCase } from '../application/obtener-historia-completa.use-case';
import { RegistrarAlergiaUseCase } from '../application/registrar-alergia.use-case';
import { RegistrarAntecedenteUseCase } from '../application/registrar-antecedente.use-case';
import {
  AbrirHistoriaDto,
  AgregarEvolucionDto,
  RegistrarAlergiaDto,
  RegistrarAntecedenteDto,
} from './dto/historia.dto';

@ApiTags('historia-clinica')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('historia-clinica/paciente/:pacienteId')
export class HistoriasController {
  constructor(
    private readonly abrir: AbrirHistoriaClinicaUseCase,
    private readonly obtener: ObtenerHistoriaCompletaUseCase,
    private readonly alergia: RegistrarAlergiaUseCase,
    private readonly antecedente: RegistrarAntecedenteUseCase,
    private readonly evolucion: AgregarEvolucionUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.MEDICO, RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  abrirHistoria(@Param('pacienteId', ParseUUIDPipe) pacienteId: string, @Body() dto: AbrirHistoriaDto) {
    return this.abrir.ejecutar(pacienteId, dto.grupoSanguineo);
  }

  @Get()
  @Roles(RolUsuario.MEDICO, RolUsuario.ENFERMERO, RolUsuario.ADMIN)
  verHistoria(@Param('pacienteId', ParseUUIDPipe) pacienteId: string) {
    return this.obtener.ejecutar(pacienteId);
  }

  @Post('alergias')
  @Roles(RolUsuario.MEDICO, RolUsuario.ENFERMERO)
  agregarAlergia(@Param('pacienteId', ParseUUIDPipe) pacienteId: string, @Body() dto: RegistrarAlergiaDto) {
    return this.alergia.ejecutar(pacienteId, dto.sustancia, dto.severidad);
  }

  @Post('antecedentes')
  @Roles(RolUsuario.MEDICO, RolUsuario.ENFERMERO)
  agregarAntecedente(@Param('pacienteId', ParseUUIDPipe) pacienteId: string, @Body() dto: RegistrarAntecedenteDto) {
    return this.antecedente.ejecutar(pacienteId, dto.parentesco, dto.descripcion);
  }

  @Post('evoluciones')
  @Roles(RolUsuario.MEDICO)
  agregarEvolucion(
    @Param('pacienteId', ParseUUIDPipe) pacienteId: string,
    @Body() dto: AgregarEvolucionDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.evolucion.ejecutar(pacienteId, usuario.id, dto.nota);
  }
}
