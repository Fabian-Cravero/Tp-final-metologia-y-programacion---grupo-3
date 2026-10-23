import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmisionesModule } from '../admisiones/admisiones.module';
import { AlertaStockListener } from './application/alerta-stock.listener';
import { AsignarCamaUseCase } from './application/asignar-cama.use-case';
import { BloquearCamaUseCase } from './application/bloquear-cama.use-case';
import { ConfirmarLimpiezaUseCase } from './application/confirmar-limpieza.use-case';
import { CrearCamaUseCase } from './application/crear-cama.use-case';
import { CrearInsumoUseCase } from './application/crear-insumo.use-case';
import { DescontarInsumoUseCase } from './application/descontar-insumo.use-case';
import { HabilitarCamaUseCase } from './application/habilitar-cama.use-case';
import { IngresarStockUseCase } from './application/ingresar-stock.use-case';
import { LiberarCamaUseCase } from './application/liberar-cama.use-case';
import { ListarInsumosUseCase } from './application/listar-insumos.use-case';
import { ObtenerMapaCamasUseCase } from './application/obtener-mapa-camas.use-case';
import { entidadesCamas } from './domain/entities';
import { CAMA_REPOSITORY } from './domain/repositories/cama-repository.interface';
import { INVENTARIO_REPOSITORY } from './domain/repositories/inventario-repository.interface';
import { TypeOrmCamaRepository } from './infrastructure/repositories/typeorm-cama.repository';
import { TypeOrmInventarioRepository } from './infrastructure/repositories/typeorm-inventario.repository';
import { CamasController } from './presentation/camas.controller';
import { GestionCamasController } from './presentation/gestion-camas.controller';
import { InventarioController } from './presentation/inventario.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesCamas), AdmisionesModule],
  controllers: [CamasController, GestionCamasController, InventarioController],
  providers: [
    { provide: CAMA_REPOSITORY, useClass: TypeOrmCamaRepository },
    { provide: INVENTARIO_REPOSITORY, useClass: TypeOrmInventarioRepository },
    AsignarCamaUseCase,
    LiberarCamaUseCase,
    ConfirmarLimpiezaUseCase,
    BloquearCamaUseCase,
    HabilitarCamaUseCase,
    CrearCamaUseCase,
    ObtenerMapaCamasUseCase,
    CrearInsumoUseCase,
    IngresarStockUseCase,
    ListarInsumosUseCase,
    DescontarInsumoUseCase,
    AlertaStockListener,
  ],
  // La API pública del módulo: lo que Atención y Enfermería puede usar.
  exports: [DescontarInsumoUseCase],
})
export class CamasModule {}
