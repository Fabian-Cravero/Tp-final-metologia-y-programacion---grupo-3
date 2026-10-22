import { TransicionInvalidaException } from '../../../shared/exceptions/domain.exception';
import { siguienteEstado } from '../turno-workflow';
import { EstadoTurno } from './turno-estado';

describe('Máquina de estados del turno', () => {
  it('recorre el camino feliz: programado -> confirmado -> en sala -> atendido', () => {
    expect(siguienteEstado('programado', 'confirmar')).toBe(EstadoTurno.CONFIRMADO);
    expect(siguienteEstado('confirmado', 'registrarLlegada')).toBe(EstadoTurno.EN_SALA_ESPERA);
    expect(siguienteEstado('en_sala_espera', 'atender')).toBe(EstadoTurno.ATENDIDO);
  });

  it('permite cancelar mientras el turno no fue atendido', () => {
    for (const estado of ['programado', 'confirmado', 'en_sala_espera']) {
      expect(siguienteEstado(estado, 'cancelar')).toBe(EstadoTurno.CANCELADO);
    }
  });

  it.each([
    ['atendido', 'cancelar'],
    ['cancelado', 'confirmar'],
    ['programado', 'atender'],        // no se puede saltar la sala de espera
    ['confirmado', 'confirmar'],
  ] as const)('rechaza %s -> %s', (estado, accion) => {
    expect(() => siguienteEstado(estado, accion)).toThrow(TransicionInvalidaException);
  });
});
