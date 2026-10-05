import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entidadesAtencionEnfermeria } from './domain/entities';
import { AtencionEnfermeriaController } from './presentation/atencion-enfermeria.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesAtencionEnfermeria)],
  controllers: [AtencionEnfermeriaController],
  providers: [],
  exports: [],
})
export class AtencionEnfermeriaModule {}
