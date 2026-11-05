import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UsuarioActual, type UsuarioAutenticado } from '../../shared/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { HistorialSignosVitalesUseCase } from '../application/historial-signos-vitales.use-case';
import { RegistrarSignoVitalUseCase } from '../application/registrar-signo-vital.use-case';
import { RegistrarSignoVitalDto } from './dto/atencion.dto';

@ApiTags('atencion-enfermeria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('atencion-enfermeria/pacientes/:pacienteId/signos-vitales')
export class SignosVitalesController {
  constructor(
    private readonly registrar: RegistrarSignoVitalUseCase,
    private readonly historial: HistorialSignosVitalesUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.ENFERMERO, RolUsuario.MEDICO)
  registrarSigno(
    @Param('pacienteId', ParseUUIDPipe) pacienteId: string,
    @Body() dto: RegistrarSignoVitalDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.registrar.ejecutar({ pacienteId, registradoPorId: usuario.id, tipo: dto.tipo, valor: dto.valor });
  }

  @Get()
  @Roles(RolUsuario.ENFERMERO, RolUsuario.MEDICO, RolUsuario.ADMIN)
  verHistorial(@Param('pacienteId', ParseUUIDPipe) pacienteId: string) {
    return this.historial.ejecutar(pacienteId);
  }
}
