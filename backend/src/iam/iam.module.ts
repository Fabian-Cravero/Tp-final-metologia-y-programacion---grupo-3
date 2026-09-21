import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './domain/entities/usuario.entity';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario-repository.interface';
import { TypeOrmUsuarioRepository } from './infrastructure/repositories/typeorm-usuario.repository';
import { IamController } from './presentation/iam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [IamController],
  providers: [
    {
      provide: USUARIO_REPOSITORY,
      useClass: TypeOrmUsuarioRepository,
    },
  ],
  exports: [USUARIO_REPOSITORY],
})
export class IamModule {}
