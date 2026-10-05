import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entidadesFacturacion } from './domain/entities';
import { FacturacionController } from './presentation/facturacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesFacturacion)],
  controllers: [FacturacionController],
  providers: [],
  exports: [],
})
export class FacturacionModule {}
