import { DomainException } from '../../shared/exceptions/domain.exception';

export type Severidad = 'normal' | 'alerta' | 'critico';

interface Rango {
  unidad: string;
  normalMin: number;
  normalMax: number;
  criticoMin: number;
  criticoMax: number;
}

/**
 * Valores de referencia para adultos, pensados para el trabajo práctico.
 * Hay que validarlos con la cátedra; no son criterio clínico.
 */
export const UMBRALES: Record<string, Rango> = {
  frecuencia_cardiaca:     { unidad: 'lpm',  normalMin: 60, normalMax: 100, criticoMin: 40, criticoMax: 130 },
  presion_sistolica:       { unidad: 'mmHg', normalMin: 90, normalMax: 140, criticoMin: 70, criticoMax: 180 },
  temperatura:             { unidad: '°C',   normalMin: 36, normalMax: 37.5, criticoMin: 35, criticoMax: 39.5 },
  saturacion_o2:           { unidad: '%',    normalMin: 95, normalMax: 100, criticoMin: 90, criticoMax: 100 },
  frecuencia_respiratoria: { unidad: 'rpm',  normalMin: 12, normalMax: 20, criticoMin: 8,  criticoMax: 30 },
};

export const TIPOS_SIGNO_VITAL = Object.keys(UMBRALES);

export function unidadDe(tipo: string): string {
  return rangoDe(tipo).unidad;
}

/** Regla pura: se prueba sin Nest ni base de datos. */
export function evaluarSignoVital(tipo: string, valor: number): Severidad {
  const r = rangoDe(tipo);
  if (valor < r.criticoMin || valor > r.criticoMax) return 'critico';
  if (valor < r.normalMin || valor > r.normalMax) return 'alerta';
  return 'normal';
}

function rangoDe(tipo: string): Rango {
  const rango = UMBRALES[tipo];
  if (!rango) throw new DomainException(`Tipo de signo vital desconocido: "${tipo}"`);
  return rango;
}
