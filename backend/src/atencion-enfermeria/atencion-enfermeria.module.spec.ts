import { Test, TestingModule } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';
import { entidadesAtencionEnfermeria } from './domain/entities';
import { AtencionEnfermeriaController } from './presentation/atencion-enfermeria.controller';

/**
 * No importamos AtencionEnfermeriaModule completo porque TypeOrmModule.forFeature() necesita
 * una conexión real a la base: se prueba el controller y las entidades por separado.
 */
describe('AtencionEnfermeriaModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AtencionEnfermeriaController],
    }).compile();
  });

  it('registra su controller', () => {
    expect(moduleRef.get(AtencionEnfermeriaController)).toBeInstanceOf(AtencionEnfermeriaController);
  });

  describe('AtencionEnfermeriaController.ping()', () => {
    it('identifica al módulo y avisa que falta implementar', () => {
      const controller = moduleRef.get(AtencionEnfermeriaController);

      expect(controller.ping()).toEqual({
        modulo: 'atencion-enfermeria',
        estado: 'estructura lista, falta implementar',
      });
    });
  });

  it('declara las tablas del módulo', () => {
    const tablas = getMetadataArgsStorage().tables;
    const nombres = entidadesAtencionEnfermeria.map((e) => tablas.find((t) => t.target === e)?.name);

    expect(nombres).toEqual(['signos_vitales', 'indicaciones_medicas', 'protocolos_cuidado', 'tareas_protocolo']);
  });
});
