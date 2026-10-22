import { TransicionInvalidaException } from '../../../shared/exceptions/domain.exception';

export enum EstadoCama {
  LIBRE = 'libre',
  OCUPADA = 'ocupada',
  EN_LIMPIEZA = 'en_limpieza',
  BLOQUEADA = 'bloqueada',
}

export abstract class CamaEstado {
  abstract readonly nombre: EstadoCama;

  asignar(): CamaEstado { throw this.rechazar('asignar'); }
  liberar(): CamaEstado { throw this.rechazar('liberar'); }
  confirmarLimpieza(): CamaEstado { throw this.rechazar('confirmar la limpieza de'); }
  bloquear(): CamaEstado { throw this.rechazar('bloquear'); }
  habilitar(): CamaEstado { throw this.rechazar('habilitar'); }

  protected rechazar(accion: string): TransicionInvalidaException {
    return new TransicionInvalidaException(
      `No se puede ${accion} una cama en estado "${this.nombre}"`,
    );
  }
}

class Libre extends CamaEstado {
  readonly nombre = EstadoCama.LIBRE;
  asignar() { return new Ocupada(); }
  bloquear() { return new Bloqueada(); }
}

class Ocupada extends CamaEstado {
  readonly nombre = EstadoCama.OCUPADA;
  liberar() { return new EnLimpieza(); }
}

class EnLimpieza extends CamaEstado {
  readonly nombre = EstadoCama.EN_LIMPIEZA;
  confirmarLimpieza() { return new Libre(); }
  bloquear() { return new Bloqueada(); }
}

class Bloqueada extends CamaEstado {
  readonly nombre = EstadoCama.BLOQUEADA;
  habilitar() { return new Libre(); }
}

export function estadoDeCama(nombre: string): CamaEstado {
  switch (nombre) {
    case EstadoCama.LIBRE: return new Libre();
    case EstadoCama.OCUPADA: return new Ocupada();
    case EstadoCama.EN_LIMPIEZA: return new EnLimpieza();
    case EstadoCama.BLOQUEADA: return new Bloqueada();
    default: throw new TransicionInvalidaException(`Estado de cama desconocido: "${nombre}"`);
  }
}
