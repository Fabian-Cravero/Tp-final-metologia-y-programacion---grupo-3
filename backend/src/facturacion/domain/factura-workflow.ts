import { TransicionInvalidaException } from '../../shared/exceptions/domain.exception';

export type AccionFactura = 'emitir' | 'pagar' | 'anular';

/** pendiente -> emitida -> pagada; se puede anular mientras no esté pagada. */
const TRANSICIONES: Record<AccionFactura, { desde: string[]; hacia: string }> = {
  emitir: { desde: ['pendiente'], hacia: 'emitida' },
  pagar: { desde: ['emitida'], hacia: 'pagada' },
  anular: { desde: ['pendiente', 'emitida'], hacia: 'anulada' },
};

export function siguienteEstadoFactura(actual: string, accion: AccionFactura): string {
  const regla = TRANSICIONES[accion];
  if (!regla.desde.includes(actual)) {
    throw new TransicionInvalidaException(`No se puede ${accion} una factura en estado "${actual}"`);
  }
  return regla.hacia;
}
