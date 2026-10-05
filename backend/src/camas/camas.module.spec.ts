import { Test, TestingModule } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';
import { entidadesCamas, Cama } from './domain/entities';
import { CamasController } from './presentation/camas.controller';

/**
 * No importamos CamasModule completo porque TypeOrmModule.forFeature() necesita
 * una conexión real a la base: se prueba el controller y las entidades por separado.
 */
describe('CamasModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [CamasController],
    }).compile();
  });

  it('registra su controller', () => {
    expect(moduleRef.get(CamasController)).toBeInstanceOf(CamasController);
  });

  describe('CamasController.ping()', () => {
    it('identifica al módulo y avisa que falta implementar', () => {
      const controller = moduleRef.get(CamasController);

      expect(controller.ping()).toEqual({
        modulo: 'camas',
        estado: 'estructura lista, falta implementar',
      });
    });
  });

  it('declara las tablas del módulo', () => {
    const tablas = getMetadataArgsStorage().tables;
    const nombres = entidadesCamas.map((e) => tablas.find((t) => t.target === e)?.name);

    expect(nombres).toEqual(['camas', 'asignaciones_cama', 'insumos', 'stock_insumos']);
  });

  it('la cama lleva columna de versión para el locking optimista', () => {
    const columnas = getMetadataArgsStorage().columns;

    expect(columnas.some((c) => c.target === Cama && c.mode === 'version')).toBe(true);
  });
});
