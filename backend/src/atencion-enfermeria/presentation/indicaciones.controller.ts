import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UsuarioActual, type UsuarioAutenticado } from '../../shared/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CancelarIndicacionUseCase } from '../application/cancelar-indicacion.use-case';
import { CumplirIndicacionUseCase } from '../application/cumplir-indicacion.use-case';
import { IndicarUseCase } from '../application/indicar.use-case';
import { ListarIndicacionesPendientesUseCase } from '../application/listar-indicaciones-pendientes.use-case';
import { CrearIndicacionDto } from './dto/atencion.dto';

@ApiTags('atencion-enfermeria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('atencion-enfermeria')
export class IndicacionesController {
  constructor(
    private readonly indicar: IndicarUseCase,
    private readonly pendientes: ListarIndicacionesPendientesUseCase,
    private readonly cumplir: CumplirIndicacionUseCase,
    private readonly cancelar: CancelarIndicacionUseCase,
  ) {}

  @Post('pacientes/:pacienteId/indicaciones')
  @Roles(RolUsuario.MEDICO)
  crear(
    @Param('pacienteId', ParseUUIDPipe) pacienteId: string,
    @Body() dto: CrearIndicacionDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.indicar.ejecutar({
      pacienteId,
      usuarioMedicoId: usuario.id,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      insumoId: dto.insumoId,
      cantidad: dto.cantidad,
    });
  }

  @Get('pacientes/:pacienteId/indicaciones')
  @Roles(RolUsuario.ENFERMERO, RolUsuario.MEDICO, RolUsuario.ADMIN)
  listarPendientes(@Param('pacienteId', ParseUUIDPipe) pacienteId: string) {
    return this.pendientes.ejecutar(pacienteId);
  }

  @Patch('indicaciones/:id/cumplir')
  @Roles(RolUsuario.ENFERMERO)
  cumplirIndicacion(@Param('id', ParseUUIDPipe) id: string) {
    return this.cumplir.ejecutar(id);
  }

  @Patch('indicaciones/:id/cancelar')
  @Roles(RolUsuario.MEDICO)
  cancelarIndicacion(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancelar.ejecutar(id);
  }
}
