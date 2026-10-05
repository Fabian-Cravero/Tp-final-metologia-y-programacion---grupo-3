import {
  ConflictoDeConcurrenciaException,
  DomainException,
} from './domain.exception';

describe('DomainException', () => {
  it('es un Error con nombre y mensaje propios', () => {
    const error = new DomainException('Transición de estado inválida');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DomainException');
    expect(error.message).toBe('Transición de estado inválida');
  });
});

describe('ConflictoDeConcurrenciaException', () => {
  it('es una DomainException e indica el recurso en conflicto', () => {
    const error = new ConflictoDeConcurrenciaException('Cama 12');

    expect(error).toBeInstanceOf(DomainException);
    expect(error.name).toBe('ConflictoDeConcurrenciaException');
    expect(error.message).toBe('Cama 12 acaba de ser modificado por otra petición');
  });
});
