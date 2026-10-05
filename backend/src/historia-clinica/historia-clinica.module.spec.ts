import { Test, TestingModule } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';
import { entidadesHistoriaClinica } from './domain/entities';
import { HistoriaClinicaController } from './presentation/historia-clinica.controller';

/**
 * No importamos HistoriaClinicaModule completo porque TypeOrmModule.forFeature() necesita
 * una conexión real a la base: se prueba el controller y las entidades por separado.
 */
describe('HistoriaClinicaModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [HistoriaClinicaController],
    }).compile();
  });

  it('registra su controller', () => {
    expect(moduleRef.get(HistoriaClinicaController)).toBeInstanceOf(HistoriaClinicaController);
  });

  describe('HistoriaClinicaController.ping()', () => {
    it('identifica al módulo y avisa que falta implementar', () => {
      const controller = moduleRef.get(HistoriaClinicaController);

      expect(controller.ping()).toEqual({
        modulo: 'historia-clinica',
        estado: 'estructura lista, falta implementar',
      });
    });
  });

  it('declara las tablas del módulo', () => {
    const tablas = getMetadataArgsStorage().tables;
    const nombres = entidadesHistoriaClinica.map((e) => tablas.find((t) => t.target === e)?.name);

    expect(nombres).toEqual(['historias_clinicas', 'alergias', 'antecedentes_familiares', 'evoluciones']);
  });
});
