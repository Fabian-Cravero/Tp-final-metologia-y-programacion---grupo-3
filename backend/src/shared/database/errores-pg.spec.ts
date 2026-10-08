import { QueryFailedError } from 'typeorm';
import { esViolacionDeUnicidad } from './errores-pg';

function errorPg(code: string) {
  const driverError = Object.assign(new Error('duplicate key'), { code });
  return new QueryFailedError('INSERT ...', [], driverError);
}

describe('esViolacionDeUnicidad', () => {
  it('reconoce el código 23505 de PostgreSQL', () => {
    expect(esViolacionDeUnicidad(errorPg('23505'))).toBe(true);
  });

  it('ignora otros errores de la base', () => {
    expect(esViolacionDeUnicidad(errorPg('23503'))).toBe(false);
  });

  it('ignora errores que no vienen de la base', () => {
    expect(esViolacionDeUnicidad(new Error('otro'))).toBe(false);
    expect(esViolacionDeUnicidad(undefined)).toBe(false);
  });
});
