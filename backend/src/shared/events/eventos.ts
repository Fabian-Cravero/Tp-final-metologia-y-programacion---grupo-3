export const EVENTOS = {
  MEDICACION_ADMINISTRADA: 'medicacion.administrada',
  STOCK_BAJO_UMBRAL: 'inventario.stock_bajo',
  SIGNO_VITAL_FUERA_DE_RANGO: 'enfermeria.signo_vital_fuera_de_rango',
} as const;

export interface MedicacionAdministradaPayload {
  indicacionId: string;
  pacienteId: string;
  insumoId: string;
  concepto: string;
  cantidad: number;
  /** numeric de Postgres llega como string, ej. "1250.50" */
  precioUnitario: string;
}

export interface StockBajoUmbralPayload {
  insumoId: string;
  nombre: string;
  stockTotal: number;
  umbralMinimo: number;
}

export interface SignoVitalFueraDeRangoPayload {
  pacienteId: string;
  tipo: string;
  valor: number;
  severidad: 'alerta' | 'critico';
}
