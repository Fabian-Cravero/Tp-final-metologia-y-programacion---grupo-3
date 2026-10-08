/**
 * Excepción base para violaciones de reglas de negocio (no errores técnicos).
 * Ejemplos: transición de estado inválida, cobertura desconocida, etc.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

/**
 * Se lanza cuando dos peticiones simultáneas chocan sobre el mismo recurso
 * (turno, cama) y el locking optimista de TypeORM detecta el conflicto.
 * Ver sección 06 del informe (Concurrencia en PostgreSQL).
 */
export class ConflictoDeConcurrenciaException extends DomainException {
  constructor(recurso: string) {
    super(`${recurso} acaba de ser modificado por otra petición`);
    this.name = 'ConflictoDeConcurrenciaException';
  }
}

export class RecursoNoEncontradoException extends DomainException {
  constructor(recurso: string) {
    super(`${recurso} no encontrado`);
    this.name = 'RecursoNoEncontradoException';
  }
}

export class TransicionInvalidaException extends DomainException {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'TransicionInvalidaException';
  }
}

export class CredencialesInvalidasException extends DomainException {
  constructor() {
    super('Email o contraseña incorrectos');
    this.name = 'CredencialesInvalidasException';
  }
}
