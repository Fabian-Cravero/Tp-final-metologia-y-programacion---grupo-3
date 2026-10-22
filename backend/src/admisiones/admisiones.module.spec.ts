import { Test, TestingModule } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';
import { entidadesAdmisiones, Turno } from './domain/entities';
import { AdmisionesController } from './presentation/admisiones.controller';

/**
 * No importamos AdmisionesModule completo porque TypeOrmModule.forFeature() necesita
 * una conexión real a la base: se prueba el controller y las entidades por separado.
 */
describe('AdmisionesModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AdmisionesController],
    }).compile();
  });

  it('registra su controller', () => {
    expect(moduleRef.get(AdmisionesController)).toBeInstanceOf(AdmisionesController);
  });

  describe('AdmisionesController.ping()', () => {
    it('identifica al módulo y indica que el módulo está implementado', () => {
      const controller = moduleRef.get(AdmisionesController);

      expect(controller.ping()).toEqual({
        modulo: 'admisiones',
        estado: 'módulo implementado',
      });
    });
  });

  it('declara las tablas del módulo', () => {
    const tablas = getMetadataArgsStorage().tables;
    const nombres = entidadesAdmisiones.map((e) => tablas.find((t) => t.target === e)?.name);

    expect(nombres).toEqual(['pacientes', 'medicos', 'turnos', 'cola_entreturno']);
  });

  it('el turno lleva columna de versión para el locking optimista', () => {
    const columnas = getMetadataArgsStorage().columns;

    expect(columnas.some((c) => c.target === Turno && c.mode === 'version')).toBe(true);
  });
});
