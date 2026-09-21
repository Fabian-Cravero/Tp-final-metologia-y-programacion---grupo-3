import { ArgumentsHost, Catch, ConflictException, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ConflictoDeConcurrenciaException, DomainException } from '../exceptions/domain.exception';

/**
 * Traduce excepciones de dominio a respuestas HTTP correctas, para que los
 * casos de uso no tengan que conocer nada de Nest/HTTP (SRP + DIP).
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof ConflictoDeConcurrenciaException
      ? new ConflictException().getStatus()
      : 422;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
