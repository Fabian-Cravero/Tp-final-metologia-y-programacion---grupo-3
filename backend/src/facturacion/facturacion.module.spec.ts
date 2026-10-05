import { Test, TestingModule } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';
import { entidadesFacturacion } from './domain/entities';
import { FacturacionController } from './presentation/facturacion.controller';

/**
 * No importamos FacturacionModule completo porque TypeOrmModule.forFeature() necesita
 * una conexión real a la base: se prueba el controller y las entidades por separado.
 */
describe('FacturacionModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [FacturacionController],
    }).compile();
  });

  it('registra su controller', () => {
    expect(moduleRef.get(FacturacionController)).toBeInstanceOf(FacturacionController);
  });

  describe('FacturacionController.ping()', () => {
    it('identifica al módulo y avisa que falta implementar', () => {
      const controller = moduleRef.get(FacturacionController);

      expect(controller.ping()).toEqual({
        modulo: 'facturacion',
        estado: 'estructura lista, falta implementar',
      });
    });
  });

  it('declara las tablas del módulo', () => {
    const tablas = getMetadataArgsStorage().tables;
    const nombres = entidadesFacturacion.map((e) => tablas.find((t) => t.target === e)?.name);

    expect(nombres).toEqual(['coberturas', 'facturas', 'lineas_factura', 'eventos_dominio']);
  });
});
