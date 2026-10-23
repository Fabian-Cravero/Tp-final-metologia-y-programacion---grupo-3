import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CrearInsumoUseCase } from '../application/crear-insumo.use-case';
import { IngresarStockUseCase } from '../application/ingresar-stock.use-case';
import { ListarInsumosUseCase } from '../application/listar-insumos.use-case';
import { CrearInsumoDto } from './dto/crear-insumo.dto';
import { IngresarStockDto } from './dto/ingresar-stock.dto';

@ApiTags('camas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('camas/insumos')
export class InventarioController {
  constructor(
    private readonly crearInsumo: CrearInsumoUseCase,
    private readonly ingresar: IngresarStockUseCase,
    private readonly listar: ListarInsumosUseCase,
  ) {}

  @Post()
  @Roles(RolUsuario.ADMIN)
  crear(@Body() dto: CrearInsumoDto) {
    return this.crearInsumo.ejecutar({
      nombre: dto.nombre,
      unidad: dto.unidad,
      umbralMinimo: dto.umbralMinimo,
      precioUnitario: dto.precioUnitario ?? '0',
    });
  }

  @Post(':id/stock')
  @Roles(RolUsuario.ADMIN, RolUsuario.ENFERMERO)
  async ingresarStock(@Param('id', ParseUUIDPipe) id: string, @Body() dto: IngresarStockDto) {
    await this.ingresar.ejecutar(id, dto.cantidad, dto.ubicacion);
    return { insumoId: id, ingresado: dto.cantidad };
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCIONISTA, RolUsuario.MEDICO, RolUsuario.ENFERMERO)
  listarInsumos() {
    return this.listar.ejecutar();
  }
}
