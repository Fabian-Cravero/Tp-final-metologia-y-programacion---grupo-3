import { EstadoCama, estadoDeCama } from './state/cama-estado';

export type AccionCama = 'asignar' | 'liberar' | 'confirmarLimpieza' | 'bloquear' | 'habilitar';

export function siguienteEstadoCama(actual: string, accion: AccionCama): EstadoCama {
  return estadoDeCama(actual)[accion]().nombre;
}
