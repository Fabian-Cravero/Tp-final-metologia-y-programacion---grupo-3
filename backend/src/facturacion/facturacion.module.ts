import { Module } from '@nestjs/common';
import { FacturacionController } from './presentation/facturacion.controller';

@Module({
  imports: [],
  controllers: [FacturacionController],
  providers: [],
  exports: [],
})
export class FacturacionModule {}
