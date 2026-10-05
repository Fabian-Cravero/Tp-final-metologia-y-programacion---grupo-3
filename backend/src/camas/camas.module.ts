import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entidadesCamas } from './domain/entities';
import { CamasController } from './presentation/camas.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesCamas)],
  controllers: [CamasController],
  providers: [],
  exports: [],
})
export class CamasModule {}
