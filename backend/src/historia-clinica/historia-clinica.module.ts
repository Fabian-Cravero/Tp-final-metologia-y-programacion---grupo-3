import { Module } from '@nestjs/common';
import { HistoriaClinicaController } from './presentation/historia-clinica.controller';

@Module({
  imports: [],
  controllers: [HistoriaClinicaController],
  providers: [],
  exports: [],
})
export class HistoriaClinicaModule {}
