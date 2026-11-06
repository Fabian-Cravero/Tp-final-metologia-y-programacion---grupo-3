import { TransicionInvalidaException } from '../../shared/exceptions/domain.exception';
import { aCentavos, deCentavos } from './dinero';
import { siguienteEstadoFactura } from './factura-workflow';

describe('Dinero en centavos', () => {
  it('convierte texto de Postgres a centavos y vuelve', () => {
    expect(aCentavos('1250.50')).toBe(125050);
    expect(aCentavos(0.1) + aCentavos(0.2)).toBe(30); // con decimales daría 0.30000000000000004
    expect(deCentavos(125050)).toBe('1250.50');
    expect(deCentavos(5)).toBe('0.05');
  });
});

describe('Ciclo de la factura', () => {
  it('pendiente -> emitida -> pagada', () => {
    expect(siguienteEstadoFactura('pendiente', 'emitir')).toBe('emitida');
    expect(siguienteEstadoFactura('emitida', 'pagar')).toBe('pagada');
  });

  it('se puede anular mientras no esté pagada', () => {
    expect(siguienteEstadoFactura('pendiente', 'anular')).toBe('anulada');
    expect(siguienteEstadoFactura('emitida', 'anular')).toBe('anulada');
  });

  it.each([
    ['pendiente', 'pagar'],
    ['pagada', 'anular'],
    ['anulada', 'emitir'],
    ['emitida', 'emitir'],
  ] as const)('rechaza %s -> %s', (estado, accion) => {
    expect(() => siguienteEstadoFactura(estado, accion)).toThrow(TransicionInvalidaException);
  });
});
