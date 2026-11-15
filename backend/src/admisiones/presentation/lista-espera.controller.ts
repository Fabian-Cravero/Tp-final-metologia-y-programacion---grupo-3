import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { AgregarAListaEsperaUseCase } from '../application/agregar-a-lista-espera.use-case';
import { ListarListaEsperaUseCase } from '../application/listar-lista-espera.use-case';
import { MarcarAvisadoUseCase } from '../application/marcar-avisado.use-case';
import { AgregarListaEsperaDto } from './dto/agregar-lista-espera.dto';

/** HU 1.3: lista de espera (standby) por médico y día. La promoción es automática al cancelar un turno. */
@ApiTags('admisiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admisiones/lista-espera')
export class ListaEsperaController {
  constructor(
    private readonly agregar: AgregarAListaEsperaUseCase,
    private readonly listar: ListarListaEsperaUseCase,
    private readonly avisado: MarcarAvisadoUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  agregarALista(@Body() dto: AgregarListaEsperaDto) {
    return this.agregar.ejecutar(dto);
  }

  @Get()
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.MEDICO, RolUsuario.ADMIN)
  listarLista(@Query('medicoId', ParseUUIDPipe) medicoId: string, @Query('dia') dia: string) {
    return this.listar.ejecutar(medicoId, dia);
  }

  @Patch(':id/avisado')
  @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
  marcarAvisado(@Param('id', ParseUUIDPipe) id: string) {
    return this.avisado.ejecutar(id);
  }
}
