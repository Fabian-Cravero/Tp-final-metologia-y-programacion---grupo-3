import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmisionesModule } from '../admisiones/admisiones.module';
import { AnularFacturaUseCase } from './application/anular-factura.use-case';
import { CoberturasUseCase } from './application/coberturas.use-case';
import { ConsultarFacturasUseCase } from './application/consultar-facturas.use-case';
import { EmitirFacturaUseCase } from './application/emitir-factura.use-case';
import { EventosPendientesUseCase } from './application/eventos-pendientes.use-case';
import { PagarFacturaUseCase } from './application/pagar-factura.use-case';
import { RegistrarCargoUseCase } from './application/registrar-cargo.use-case';
import { entidadesFacturacion } from './domain/entities';
import { CoberturaParticular } from './domain/estrategias/cobertura-particular';
import { CoberturaPrepaga } from './domain/estrategias/cobertura-prepaga';
import { CoberturaPublica } from './domain/estrategias/cobertura-publica';
import { ESTRATEGIAS_COBERTURA, type IEstrategiaCobertura } from './domain/estrategias/estrategia-cobertura.interface';
import { ResolverEstrategiaCobertura } from './domain/estrategias/resolver-estrategia';
import { EVENTO_DOMINIO_REPOSITORY } from './domain/repositories/evento-dominio-repository.interface';
import { FACTURA_REPOSITORY } from './domain/repositories/factura-repository.interface';
import { MedicacionAdministradaListener } from './infrastructure/listeners/medicacion-administrada.listener';
import { TypeOrmEventoDominioRepository } from './infrastructure/repositories/typeorm-evento-dominio.repository';
import { TypeOrmFacturaRepository } from './infrastructure/repositories/typeorm-factura.repository';
import { SembrarCoberturasService } from './infrastructure/sembrar-coberturas.service';
import { CoberturasController } from './presentation/coberturas.controller';
import { FacturacionController } from './presentation/facturacion.controller';
import { FacturasController } from './presentation/facturas.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesFacturacion), AdmisionesModule],
  controllers: [FacturacionController, FacturasController, CoberturasController],
  providers: [
    { provide: FACTURA_REPOSITORY, useClass: TypeOrmFacturaRepository },
    { provide: EVENTO_DOMINIO_REPOSITORY, useClass: TypeOrmEventoDominioRepository },

    // Strategy: para sumar una cobertura nueva, agregar su clase acá y en `inject`.
    CoberturaPublica,
    CoberturaPrepaga,
    CoberturaParticular,
    {
      provide: ESTRATEGIAS_COBERTURA,
      useFactory: (...estrategias: IEstrategiaCobertura[]) => estrategias,
      inject: [CoberturaPublica, CoberturaPrepaga, CoberturaParticular],
    },
    ResolverEstrategiaCobertura,

    RegistrarCargoUseCase,
    ConsultarFacturasUseCase,
    EmitirFacturaUseCase,
    PagarFacturaUseCase,
    AnularFacturaUseCase,
    CoberturasUseCase,
    EventosPendientesUseCase,

    // Observer: escucha MedicacionAdministrada que publica Atención y Enfermería.
    MedicacionAdministradaListener,
    SembrarCoberturasService,
  ],
})
export class FacturacionModule {}
