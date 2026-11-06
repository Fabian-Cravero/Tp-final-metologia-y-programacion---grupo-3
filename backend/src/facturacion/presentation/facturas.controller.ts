import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AnularFacturaUseCase } from '../application/anular-factura.use-case';
import { ConsultarFacturasUseCase } from '../application/consultar-facturas.use-case';
import { EmitirFacturaUseCase } from '../application/emitir-factura.use-case';
import { EventosPendientesUseCase } from '../application/eventos-pendientes.use-case';
import { PagarFacturaUseCase } from '../application/pagar-factura.use-case';
import { RegistrarCargoUseCase } from '../application/registrar-cargo.use-case';
import { AgregarCargoDto } from './dto/facturacion.dto';

@ApiTags('facturacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturacion')
export class FacturasController {
  constructor(
    private readonly consultar: ConsultarFacturasUseCase,
    private readonly cargo: RegistrarCargoUseCase,
    private readonly emitir: EmitirFacturaUseCase,
    private readonly pagar: PagarFacturaUseCase,
    private readonly anular: AnularFacturaUseCase,
    private readonly pendientes: EventosPendientesUseCase,
  ) {}

  @Get('facturas/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  ver(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.detalle(id);
  }

  @Get('pacientes/:pacienteId/facturas')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  listar(@Param('pacienteId', ParseUUIDPipe) pacienteId: string) {
    return this.consultar.delPaciente(pacienteId);
  }

  /** Carga manual (consulta, estudio...). Las medicaciones llegan solas desde Atención y Enfermería. */
  @Post('pacientes/:pacienteId/cargos')
  @Roles(RolUsuario.ADMIN)
  cargoManual(@Param('pacienteId', ParseUUIDPipe) pacienteId: string, @Body() dto: AgregarCargoDto) {
    return this.cargo.ejecutar({
      pacienteId,
      concepto: dto.concepto,
      cantidad: dto.cantidad,
      precioUnitario: dto.precioUnitario,
    });
  }

  @Patch('facturas/:id/emitir')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  emitirFactura(@Param('id', ParseUUIDPipe) id: string) {
    return this.emitir.ejecutar(id);
  }

  @Patch('facturas/:id/pagar')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA)
  pagarFactura(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagar.ejecutar(id);
  }

  @Patch('facturas/:id/anular')
  @Roles(RolUsuario.ADMIN)
  anularFactura(@Param('id', ParseUUIDPipe) id: string) {
    return this.anular.ejecutar(id);
  }

  /** Eventos de medicación que llegaron y no se pudieron facturar (outbox con procesado = false). */
  @Get('eventos-pendientes')
  @Roles(RolUsuario.ADMIN)
  eventosPendientes() {
    return this.pendientes.ejecutar();
  }
}
