import { type EstadoTurno, estadoDeTurno } from './state/turno-estado';

export type AccionTurno = 'confirmar' | 'registrarLlegada' | 'atender' | 'cancelar';

/** Devuelve el estado siguiente o lanza TransicionInvalidaException (HTTP 422). */
export function siguienteEstado(actual: string, accion: AccionTurno): EstadoTurno {
  return estadoDeTurno(actual)[accion]().nombre;
}
