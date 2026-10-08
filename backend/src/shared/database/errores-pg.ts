import { QueryFailedError } from 'typeorm';

/** 23505 = unique_violation en PostgreSQL. */
export function esViolacionDeUnicidad(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const e = error as QueryFailedError & { code?: string; driverError?: { code?: string } };
  return e.code === '23505' || e.driverError?.code === '23505';
}
