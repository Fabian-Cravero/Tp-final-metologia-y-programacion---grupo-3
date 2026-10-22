import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AdmisionesController } from '../src/admisiones/presentation/admisiones.controller';
import { AtencionEnfermeriaController } from '../src/atencion-enfermeria/presentation/atencion-enfermeria.controller';
import { CamasController } from '../src/camas/presentation/camas.controller';
import { FacturacionController } from '../src/facturacion/presentation/facturacion.controller';
import { HistoriaClinicaController } from '../src/historia-clinica/presentation/historia-clinica.controller';
import { IamController } from '../src/iam/presentation/iam.controller';
import {
  ConflictoDeConcurrenciaException,
  DomainException,
} from '../src/shared/exceptions/domain.exception';
import { DomainExceptionFilter } from '../src/shared/filters/domain-exception.filter';

/**
 * Controller auxiliar, solo para probar de punta a punta cómo el filtro global
 * traduce las excepciones de dominio a respuestas HTTP.
 */
@Controller('prueba-dominio')
class PruebaDominioController {
  @Get('regla')
  regla() {
    throw new DomainException('Transición de estado inválida');
  }

  @Get('conflicto')
  conflicto() {
    throw new ConflictoDeConcurrenciaException('Cama 12');
  }
}

/**
 * E2E de la capa HTTP de todos los módulos. Se montan los controllers sin
 * TypeOrmModule a propósito: así el test no necesita PostgreSQL levantado y
 * puede correr igual en la máquina de cualquier compañero o en CI.
 */
describe('HIS API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        IamController,
        AdmisionesController,
        HistoriaClinicaController,
        AtencionEnfermeriaController,
        CamasController,
        FacturacionController,
        PruebaDominioController,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /<modulo>/ping', () => {
    it.each([
      ['iam', 'estructura lista, falta implementar login'],
      ['admisiones', 'módulo implementado'],
      ['historia-clinica', 'estructura lista, falta implementar'],
      ['atencion-enfermeria', 'estructura lista, falta implementar'],
      ['camas', 'estructura lista, falta implementar'],
      ['facturacion', 'estructura lista, falta implementar'],
    ])('el módulo %s responde 200 con su estado', async (modulo, estado) => {
      const respuesta = await request(app.getHttpServer())
        .get(`/${modulo}/ping`)
        .expect(200);

      expect(respuesta.body).toEqual({ modulo, estado });
    });
  });

  describe('manejo de excepciones de dominio', () => {
    it('una regla de negocio violada responde 422', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/prueba-dominio/regla')
        .expect(422);

      expect(respuesta.body).toEqual({
        statusCode: 422,
        error: 'DomainException',
        message: 'Transición de estado inválida',
      });
    });

    it('un conflicto de concurrencia responde 409', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/prueba-dominio/conflicto')
        .expect(409);

      expect(respuesta.body).toEqual({
        statusCode: 409,
        error: 'ConflictoDeConcurrenciaException',
        message: 'Cama 12 acaba de ser modificado por otra petición',
      });
    });
  });

  it('una ruta inexistente responde 404', () => {
    return request(app.getHttpServer()).get('/no-existe').expect(404);
  });
});
