import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IamController } from './presentation/iam.controller';
import { Usuario } from './domain/entities/usuario.entity';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from './domain/repositories/usuario-repository.interface';
import { TypeOrmUsuarioRepository } from './infrastructure/repositories/typeorm-usuario.repository';

/**
 * No importamos IamModule completo porque TypeOrmModule.forFeature() necesita
 * una conexión real a la base. En su lugar replicamos el mismo wiring del módulo
 * (token de la interfaz -> implementación TypeORM) con un Repository falso.
 * Esto además comprueba la inversión de dependencias: los consumidores piden
 * USUARIO_REPOSITORY, nunca la clase de TypeORM.
 */
describe('IamModule (wiring)', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [IamController],
      providers: [
        { provide: USUARIO_REPOSITORY, useClass: TypeOrmUsuarioRepository },
        {
          provide: getRepositoryToken(Usuario),
          useValue: { findOneBy: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();
  });

  it('registra el controller', () => {
    expect(moduleRef.get(IamController)).toBeInstanceOf(IamController);
  });

  it('resuelve USUARIO_REPOSITORY con la implementación de TypeORM (DIP)', () => {
    const repo = moduleRef.get<IUsuarioRepository>(USUARIO_REPOSITORY);

    expect(repo).toBeInstanceOf(TypeOrmUsuarioRepository);
  });

  describe('IamController.ping()', () => {
    it('identifica al módulo y avisa que falta implementar el login', () => {
      const controller = moduleRef.get(IamController);

      expect(controller.ping()).toEqual({
        modulo: 'iam',
        estado: 'estructura lista, falta implementar login',
      });
    });
  });
});
