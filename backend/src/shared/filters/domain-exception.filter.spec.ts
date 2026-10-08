import { ArgumentsHost } from '@nestjs/common';
import {
  ConflictoDeConcurrenciaException,
  CredencialesInvalidasException,
  DomainException,
  RecursoNoEncontradoException,
} from '../exceptions/domain.exception';
import { DomainExceptionFilter } from './domain-exception.filter';

function crearHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  it('traduce una DomainException a HTTP 422', () => {
    const { host, status, json } = crearHost();

    filter.catch(new DomainException('Cobertura desconocida'), host);

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith({
      statusCode: 422,
      error: 'DomainException',
      message: 'Cobertura desconocida',
    });
  });

  it('traduce un conflicto de concurrencia a HTTP 409', () => {
    const { host, status, json } = crearHost();

    filter.catch(new ConflictoDeConcurrenciaException('Turno'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'ConflictoDeConcurrenciaException',
      message: 'Turno acaba de ser modificado por otra petición',
    });
  });

  it('traduce un recurso inexistente a HTTP 404', () => {
    const { host, status, json } = crearHost();

    filter.catch(new RecursoNoEncontradoException('Paciente'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'RecursoNoEncontradoException',
      message: 'Paciente no encontrado',
    });
  });

  it('traduce credenciales inválidas a HTTP 401', () => {
    const { host, status, json } = crearHost();

    filter.catch(new CredencialesInvalidasException(), host);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      statusCode: 401,
      error: 'CredencialesInvalidasException',
      message: 'Email o contraseña incorrectos',
    });
  });
});
