import { Module } from '@nestjs/common';
import { AtencionEnfermeriaController } from './presentation/atencion-enfermeria.controller';

@Module({
  imports: [],
  controllers: [AtencionEnfermeriaController],
  providers: [],
  exports: [],
})
export class AtencionEnfermeriaModule {}
