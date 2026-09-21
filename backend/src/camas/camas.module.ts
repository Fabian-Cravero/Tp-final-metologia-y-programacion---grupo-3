import { Module } from '@nestjs/common';
import { CamasController } from './presentation/camas.controller';

@Module({
  imports: [],
  controllers: [CamasController],
  providers: [],
  exports: [],
})
export class CamasModule {}
