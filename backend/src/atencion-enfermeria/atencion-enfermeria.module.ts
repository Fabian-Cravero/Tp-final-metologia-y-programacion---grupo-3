import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmisionesModule } from '../admisiones/admisiones.module';
import { CamasModule } from '../camas/camas.module';
import { AlertaSignoVitalListener } from './application/alerta-signo-vital.listener';
import { CancelarIndicacionUseCase } from './application/cancelar-indicacion.use-case';
import { CompletarTareaUseCase } from './application/completar-tarea.use-case';
import { ConsultarProtocolosUseCase } from './application/consultar-protocolos.use-case';
import { CumplirIndicacionUseCase } from './application/cumplir-indicacion.use-case';
import { HistorialSignosVitalesUseCase } from './application/historial-signos-vitales.use-case';
import { IndicarUseCase } from './application/indicar.use-case';
import { IniciarProtocoloUseCase } from './application/iniciar-protocolo.use-case';
import { ListarIndicacionesPendientesUseCase } from './application/listar-indicaciones-pendientes.use-case';
import { RegistrarSignoVitalUseCase } from './application/registrar-signo-vital.use-case';
import { entidadesAtencionEnfermeria } from './domain/entities';
import { INDICACION_REPOSITORY } from './domain/repositories/indicacion-repository.interface';
import { PROTOCOLO_REPOSITORY } from './domain/repositories/protocolo-repository.interface';
import { SIGNO_VITAL_REPOSITORY } from './domain/repositories/signo-vital-repository.interface';
import { TypeOrmIndicacionRepository } from './infrastructure/repositories/typeorm-indicacion.repository';
import { TypeOrmProtocoloRepository } from './infrastructure/repositories/typeorm-protocolo.repository';
import { TypeOrmSignoVitalRepository } from './infrastructure/repositories/typeorm-signo-vital.repository';
import { AtencionEnfermeriaController } from './presentation/atencion-enfermeria.controller';
import { IndicacionesController } from './presentation/indicaciones.controller';
import { ProtocolosController } from './presentation/protocolos.controller';
import { SignosVitalesController } from './presentation/signos-vitales.controller';

@Module({
  // Admisiones: validar pacientes y médicos. Camas: descontar insumos al cumplir una indicación.
  imports: [TypeOrmModule.forFeature(entidadesAtencionEnfermeria), AdmisionesModule, CamasModule],
  controllers: [
    AtencionEnfermeriaController,
    SignosVitalesController,
    IndicacionesController,
    ProtocolosController,
  ],
  providers: [
    { provide: SIGNO_VITAL_REPOSITORY, useClass: TypeOrmSignoVitalRepository },
    { provide: INDICACION_REPOSITORY, useClass: TypeOrmIndicacionRepository },
    { provide: PROTOCOLO_REPOSITORY, useClass: TypeOrmProtocoloRepository },
    RegistrarSignoVitalUseCase,
    HistorialSignosVitalesUseCase,
    AlertaSignoVitalListener,
    IndicarUseCase,
    ListarIndicacionesPendientesUseCase,
    CumplirIndicacionUseCase,
    CancelarIndicacionUseCase,
    IniciarProtocoloUseCase,
    ConsultarProtocolosUseCase,
    CompletarTareaUseCase,
  ],
})
export class AtencionEnfermeriaModule {}
