export interface CalculoCargo {
  montoCubiertoCentavos: number;
  montoPacienteCentavos: number;
}

/** Puerto del Strategy: una implementación por tipo de cobertura. */
export interface IEstrategiaCobertura {
  /** Coincide con Cobertura.tipo: 'publica' | 'prepaga' | 'particular' | ... */
  readonly tipo: string;
  calcular(baseCentavos: number, porcentajeCobertura: number): CalculoCargo;
}

export const ESTRATEGIAS_COBERTURA = Symbol('ESTRATEGIAS_COBERTURA');
