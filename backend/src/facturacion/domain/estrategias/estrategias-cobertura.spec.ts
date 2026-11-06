import { DomainException } from '../../../shared/exceptions/domain.exception';
import { CoberturaParticular } from './cobertura-particular';
import { CoberturaPrepaga } from './cobertura-prepaga';
import { CoberturaPublica } from './cobertura-publica';
import { ResolverEstrategiaCobertura } from './resolver-estrategia';

describe('Estrategias de cobertura', () => {
  const base = 1_000_000; // $10.000,00 en centavos

  it('pública: lo cubre todo', () => {
    expect(new CoberturaPublica().calcular(base)).toEqual({ montoCubiertoCentavos: 1_000_000, montoPacienteCentavos: 0 });
  });

  it('particular: el paciente paga todo', () => {
    expect(new CoberturaParticular().calcular(base)).toEqual({ montoCubiertoCentavos: 0, montoPacienteCentavos: 1_000_000 });
  });

  it('prepaga al 70%: $7.000 cubiertos y $3.000 a cargo del paciente', () => {
    expect(new CoberturaPrepaga().calcular(base, 70)).toEqual({ montoCubiertoCentavos: 700_000, montoPacienteCentavos: 300_000 });
  });

  it('prepaga: cubierto + paciente siempre suman la base, incluso con redondeo', () => {
    const r = new CoberturaPrepaga().calcular(333, 70); // 233,1 se redondea a 233
    expect(r.montoCubiertoCentavos + r.montoPacienteCentavos).toBe(333);
  });
});

describe('ResolverEstrategiaCobertura', () => {
  const resolver = new ResolverEstrategiaCobertura([new CoberturaPublica(), new CoberturaParticular()]);

  it('devuelve la estrategia que coincide con el tipo', () => {
    expect(resolver.para('publica')).toBeInstanceOf(CoberturaPublica);
  });

  it('falla si el tipo no tiene estrategia (una cobertura nueva sin implementar)', () => {
    expect(() => resolver.para('art')).toThrow(DomainException);
  });
});
