import { DomainException } from '../../shared/exceptions/domain.exception';
import { evaluarSignoVital, unidadDe } from './umbrales-signos-vitales';

describe('evaluarSignoVital', () => {
  it.each([
    ['frecuencia_cardiaca', 75, 'normal'],
    ['frecuencia_cardiaca', 110, 'alerta'],
    ['frecuencia_cardiaca', 35, 'critico'],
    ['temperatura', 36.8, 'normal'],
    ['temperatura', 38.2, 'alerta'],
    ['temperatura', 40, 'critico'],
    ['saturacion_o2', 97, 'normal'],
    ['saturacion_o2', 92, 'alerta'],
    ['saturacion_o2', 85, 'critico'],
  ] as const)('%s = %s es %s', (tipo, valor, esperado) => {
    expect(evaluarSignoVital(tipo, valor)).toBe(esperado);
  });

  it('los bordes del rango normal todavía son normales', () => {
    expect(evaluarSignoVital('frecuencia_cardiaca', 60)).toBe('normal');
    expect(evaluarSignoVital('frecuencia_cardiaca', 100)).toBe('normal');
  });

  it('cada tipo tiene su unidad', () => {
    expect(unidadDe('temperatura')).toBe('°C');
    expect(unidadDe('presion_sistolica')).toBe('mmHg');
  });

  it('rechaza un tipo desconocido', () => {
    expect(() => evaluarSignoVital('azucar', 90)).toThrow(DomainException);
  });
});
