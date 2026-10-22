import { TransicionInvalidaException } from '../../../shared/exceptions/domain.exception';
import { siguienteEstadoCama } from '../cama-workflow';
import { EstadoCama } from './cama-estado';

describe('Máquina de estados de la cama', () => {
  it('recorre el ciclo completo: libre -> ocupada -> en limpieza -> libre', () => {
    expect(siguienteEstadoCama('libre', 'asignar')).toBe(EstadoCama.OCUPADA);
    expect(siguienteEstadoCama('ocupada', 'liberar')).toBe(EstadoCama.EN_LIMPIEZA);
    expect(siguienteEstadoCama('en_limpieza', 'confirmarLimpieza')).toBe(EstadoCama.LIBRE);
  });

  it.each([
    ['ocupada', 'confirmarLimpieza'],   // no salta de ocupada a libre sin limpieza
    ['ocupada', 'bloquear'],
    ['ocupada', 'asignar'],
    ['en_limpieza', 'asignar'],
    ['bloqueada', 'asignar'],
    ['libre', 'liberar'],
  ] as const)('rechaza %s -> %s', (estado, accion) => {
    expect(() => siguienteEstadoCama(estado, accion)).toThrow(TransicionInvalidaException);
  });
});
