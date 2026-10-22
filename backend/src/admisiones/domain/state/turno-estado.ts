import { TransicionInvalidaException } from '../../../shared/exceptions/domain.exception';

export enum EstadoTurno {
  PROGRAMADO = 'programado',
  CONFIRMADO = 'confirmado',
  EN_SALA_ESPERA = 'en_sala_espera',
  ATENDIDO = 'atendido',
  CANCELADO = 'cancelado',
}

/** Estado base: toda acción está prohibida salvo que el estado concreto la permita. */
export abstract class TurnoEstado {
  abstract readonly nombre: EstadoTurno;

  confirmar(): TurnoEstado { throw this.rechazar('confirmar'); }
  registrarLlegada(): TurnoEstado { throw this.rechazar('registrar la llegada de'); }
  atender(): TurnoEstado { throw this.rechazar('atender'); }
  cancelar(): TurnoEstado { throw this.rechazar('cancelar'); }

  protected rechazar(accion: string): TransicionInvalidaException {
    return new TransicionInvalidaException(
      `No se puede ${accion} un turno en estado "${this.nombre}"`,
    );
  }
}

class Programado extends TurnoEstado {
  readonly nombre = EstadoTurno.PROGRAMADO;
  confirmar() { return new Confirmado(); }
  registrarLlegada() { return new EnSalaDeEspera(); }
  cancelar() { return new Cancelado(); }
}

class Confirmado extends TurnoEstado {
  readonly nombre = EstadoTurno.CONFIRMADO;
  registrarLlegada() { return new EnSalaDeEspera(); }
  cancelar() { return new Cancelado(); }
}

class EnSalaDeEspera extends TurnoEstado {
  readonly nombre = EstadoTurno.EN_SALA_ESPERA;
  atender() { return new Atendido(); }
  cancelar() { return new Cancelado(); }
}

class Atendido extends TurnoEstado {
  readonly nombre = EstadoTurno.ATENDIDO;
}

class Cancelado extends TurnoEstado {
  readonly nombre = EstadoTurno.CANCELADO;
}

/** Reconstruye el objeto-estado a partir del texto guardado en la base. */
export function estadoDeTurno(nombre: string): TurnoEstado {
  switch (nombre) {
    case EstadoTurno.PROGRAMADO: return new Programado();
    case EstadoTurno.CONFIRMADO: return new Confirmado();
    case EstadoTurno.EN_SALA_ESPERA: return new EnSalaDeEspera();
    case EstadoTurno.ATENDIDO: return new Atendido();
    case EstadoTurno.CANCELADO: return new Cancelado();
    default: throw new TransicionInvalidaException(`Estado de turno desconocido: "${nombre}"`);
  }
}
