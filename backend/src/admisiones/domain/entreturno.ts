import { DomainException } from '../../shared/exceptions/domain.exception';
import { EstadoTurno } from './state/turno-estado';

/** HU 1.2: duración mínima que puede quedarle a un turno, o tener un entreturno. */
export const DURACION_MINIMA_MINUTOS = 5;

/** Lo que el cálculo necesita saber de cada turno de la agenda. */
export interface TurnoDeAgenda {
  id: string;
  fechaHora: Date;
  duracionMinutos: number;
  estado: string;
  version: number;
}

/** Resultado del cálculo: cómo queda el turno anterior y cuánto dura el entreturno. */
export interface PlanEntreturno {
  turnoAnteriorId: string;
  versionAnterior: number;
  nuevaDuracionAnterior: number;
  duracionEntreturno: number;
}

const minutosEntre = (desde: Date, hasta: Date) => Math.round((hasta.getTime() - desde.getTime()) / 60_000);
const finDe = (t: TurnoDeAgenda) => new Date(t.fechaHora.getTime() + t.duracionMinutos * 60_000);

/**
 * Lógica pura de la HU 1.2 (sin base de datos, fácil de testear).
 *
 * Ejemplo de la historia de usuario: turnos de 30 minutos a las 10:00 y a las 10:30.
 * Un entreturno a las 10:15 deja el turno de las 10:00 en 15 minutos y ocupa de 10:15 a 10:30.
 */
export function planificarEntreturno(agenda: TurnoDeAgenda[], inicio: Date): PlanEntreturno {
  const activos = agenda.filter((t) => t.estado !== EstadoTurno.CANCELADO);

  if (activos.some((t) => t.fechaHora.getTime() === inicio.getTime())) {
    throw new DomainException('Ya hay un turno que empieza a esa hora');
  }

  // El turno que está en curso a esa hora: empieza antes y termina después.
  const anterior = activos.find((t) => t.fechaHora < inicio && finDe(t) > inicio);
  if (!anterior) {
    throw new DomainException(
      'El entreturno tiene que caer dentro de un turno existente. Si el horario está libre, reservá un turno común',
    );
  }
  if (anterior.estado === EstadoTurno.ATENDIDO) {
    throw new DomainException('El turno anterior ya fue atendido: no se le puede quitar tiempo');
  }

  const nuevaDuracionAnterior = minutosEntre(anterior.fechaHora, inicio);
  if (nuevaDuracionAnterior < DURACION_MINIMA_MINUTOS) {
    throw new DomainException(`El turno anterior quedaría con menos de ${DURACION_MINIMA_MINUTOS} minutos`);
  }

  // El entreturno termina donde terminaba el anterior, o antes si otro turno empieza primero.
  const proximoInicio = activos
    .filter((t) => t.fechaHora > inicio)
    .map((t) => t.fechaHora.getTime())
    .sort((a, b) => a - b)[0];
  const fin = new Date(Math.min(finDe(anterior).getTime(), proximoInicio ?? Infinity));
  const duracionEntreturno = minutosEntre(inicio, fin);
  if (duracionEntreturno < DURACION_MINIMA_MINUTOS) {
    throw new DomainException(`El entreturno duraría menos de ${DURACION_MINIMA_MINUTOS} minutos`);
  }

  return {
    turnoAnteriorId: anterior.id,
    versionAnterior: anterior.version,
    nuevaDuracionAnterior,
    duracionEntreturno,
  };
}
