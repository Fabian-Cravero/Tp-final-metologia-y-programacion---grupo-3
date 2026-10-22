import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { AtenderTurnoUseCase } from '../application/atender-turno.use-case';
import { CancelarTurnoUseCase } from '../application/cancelar-turno.use-case';
import { ConfirmarTurnoUseCase } from '../application/confirmar-turno.use-case';
import { ListarAgendaUseCase } from '../application/listar-agenda.use-case';
import { RegistrarLlegadaUseCase } from '../application/registrar-llegada.use-case';
import { ReservarTurnoUseCase } from '../application/reservar-turno.use-case';
import { ReservarTurnoDto } from './dto/reservar-turno.dto';

@ApiTags('admisiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admisiones/turnos')
export class TurnosController {
  constructor(
    private readonly reservar: ReservarTurnoUseCase,
    private readonly confirmar: ConfirmarTurnoUseCase,
    private readonly llegada: RegistrarLlegadaUseCase,
    private readonly atender: AtenderTurnoUseCase,
    private readonly cancelar: CancelarTurnoUseCase,
    private readonly agenda: ListarAgendaUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  crear(@Body() dto: ReservarTurnoDto) {
    return this.reservar.ejecutar(dto);
  }

  @Get()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.MEDICO, RolUsuario.ADMIN)
  listar(@Query('medicoId', ParseUUIDPipe) medicoId: string, @Query('dia') dia: string) {
    return this.agenda.ejecutar(medicoId, new Date(dia));
  }

  @Patch(':id/confirmar')
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  confirmarTurno(@Param('id', ParseUUIDPipe) id: string) {
    return this.confirmar.ejecutar(id);
  }

  @Patch(':id/llegada')
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  registrarLlegada(@Param('id', ParseUUIDPipe) id: string) {
    return this.llegada.ejecutar(id);
  }

  @Patch(':id/atender')
  @Roles(RolUsuario.MEDICO)
  atenderTurno(@Param('id', ParseUUIDPipe) id: string) {
    return this.atender.ejecutar(id);
  }

  @Patch(':id/cancelar')
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  cancelarTurno(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancelar.ejecutar(id);
  }
}
