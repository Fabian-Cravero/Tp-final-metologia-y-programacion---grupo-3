import { Module } from '@nestjs/common';
import { AdmisionesController } from './presentation/admisiones.controller';

@Module({
  imports: [],
  controllers: [AdmisionesController],
  providers: [],
  exports: [],
})
export class AdmisionesModule {}
