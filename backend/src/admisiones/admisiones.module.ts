import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entidadesAdmisiones } from './domain/entities';
import { AdmisionesController } from './presentation/admisiones.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesAdmisiones)],
  controllers: [AdmisionesController],
  providers: [],
  exports: [],
})
export class AdmisionesModule {}
