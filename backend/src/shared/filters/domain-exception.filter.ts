import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  ConflictoDeConcurrenciaException,
  CredencialesInvalidasException,
  DomainException,
  RecursoNoEncontradoException,
} from '../exceptions/domain.exception';

/**
 * Traduce excepciones de dominio a respuestas HTTP correctas, para que los
 * casos de uso no tengan que conocer nada de Nest/HTTP (SRP + DIP).
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.estadoHttp(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }

  private estadoHttp(exception: DomainException): number {
    if (exception instanceof ConflictoDeConcurrenciaException) return HttpStatus.CONFLICT;
    if (exception instanceof RecursoNoEncontradoException) return HttpStatus.NOT_FOUND;
    if (exception instanceof CredencialesInvalidasException) return HttpStatus.UNAUTHORIZED;
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
