import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entidadesHistoriaClinica } from './domain/entities';
import { HistoriaClinicaController } from './presentation/historia-clinica.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesHistoriaClinica)],
  controllers: [HistoriaClinicaController],
  providers: [],
  exports: [],
})
export class HistoriaClinicaModule {}
