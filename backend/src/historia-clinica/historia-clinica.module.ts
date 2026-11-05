import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmisionesModule } from '../admisiones/admisiones.module';
import { AbrirHistoriaClinicaUseCase } from './application/abrir-historia-clinica.use-case';
import { AgregarEvolucionUseCase } from './application/agregar-evolucion.use-case';
import { ObtenerHistoriaCompletaUseCase } from './application/obtener-historia-completa.use-case';
import { RegistrarAlergiaUseCase } from './application/registrar-alergia.use-case';
import { RegistrarAntecedenteUseCase } from './application/registrar-antecedente.use-case';
import { entidadesHistoriaClinica } from './domain/entities';
import { HISTORIA_CLINICA_REPOSITORY } from './domain/repositories/historia-clinica-repository.interface';
import { TypeOrmHistoriaClinicaRepository } from './infrastructure/repositories/typeorm-historia-clinica.repository';
import { HistoriaClinicaController } from './presentation/historia-clinica.controller';
import { HistoriasController } from './presentation/historias.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesHistoriaClinica), AdmisionesModule],
  controllers: [HistoriaClinicaController, HistoriasController],
  providers: [
    { provide: HISTORIA_CLINICA_REPOSITORY, useClass: TypeOrmHistoriaClinicaRepository },
    AbrirHistoriaClinicaUseCase,
    RegistrarAlergiaUseCase,
    RegistrarAntecedenteUseCase,
    AgregarEvolucionUseCase,
    ObtenerHistoriaCompletaUseCase,
  ],
  // Atención y Enfermería puede consultar alergias antes de indicar una medicación.
  exports: [HISTORIA_CLINICA_REPOSITORY],
})
export class HistoriaClinicaModule {}
