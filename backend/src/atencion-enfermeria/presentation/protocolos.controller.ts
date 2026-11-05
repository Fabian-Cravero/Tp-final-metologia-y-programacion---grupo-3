import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CompletarTareaUseCase } from '../application/completar-tarea.use-case';
import { ConsultarProtocolosUseCase } from '../application/consultar-protocolos.use-case';
import { IniciarProtocoloUseCase } from '../application/iniciar-protocolo.use-case';
import { IniciarProtocoloDto } from './dto/atencion.dto';

@ApiTags('atencion-enfermeria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('atencion-enfermeria')
export class ProtocolosController {
  constructor(
    private readonly iniciar: IniciarProtocoloUseCase,
    private readonly consultar: ConsultarProtocolosUseCase,
    private readonly completar: CompletarTareaUseCase,
  ) {}

  @Post('pacientes/:pacienteId/protocolos')
  @Roles(RolUsuario.ENFERMERO, RolUsuario.MEDICO)
  iniciarProtocolo(@Param('pacienteId', ParseUUIDPipe) pacienteId: string, @Body() dto: IniciarProtocoloDto) {
    return this.iniciar.ejecutar(pacienteId, dto.motivoIngreso);
  }

  @Get('pacientes/:pacienteId/protocolos')
  @Roles(RolUsuario.ENFERMERO, RolUsuario.MEDICO)
  protocolosDelPaciente(@Param('pacienteId', ParseUUIDPipe) pacienteId: string) {
    return this.consultar.delPaciente(pacienteId);
  }

  @Get('protocolos/:id/tareas')
  @Roles(RolUsuario.ENFERMERO, RolUsuario.MEDICO)
  verTareas(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.conTareas(id);
  }

  @Patch('tareas/:id/completar')
  @Roles(RolUsuario.ENFERMERO)
  completarTarea(@Param('id', ParseUUIDPipe) id: string) {
    return this.completar.ejecutar(id);
  }
}
