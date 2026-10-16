import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginUseCase } from './application/login.use-case';
import { RegistrarUsuarioUseCase } from './application/registrar-usuario.use-case';
import { Usuario } from './domain/entities/usuario.entity';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario-repository.interface';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { TOKEN_SERVICE } from './domain/services/token-service.interface';
import { TypeOrmUsuarioRepository } from './infrastructure/repositories/typeorm-usuario.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
import { SembrarAdminService } from './infrastructure/security/sembrar-admin.service';
import { AuthController } from './presentation/auth.controller';
import { IamController } from './presentation/iam.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [IamController, AuthController],
  providers: [
    { provide: USUARIO_REPOSITORY, useClass: TypeOrmUsuarioRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    JwtStrategy,
    RegistrarUsuarioUseCase,
    LoginUseCase,
    SembrarAdminService,
  ],
  exports: [USUARIO_REPOSITORY],
})
export class IamModule {}
