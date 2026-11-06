import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { CoberturaParticular } from '../domain/estrategias/cobertura-particular';
import { CoberturaPrepaga } from '../domain/estrategias/cobertura-prepaga';
import { CoberturaPublica } from '../domain/estrategias/cobertura-publica';
import { ResolverEstrategiaCobertura } from '../domain/estrategias/resolver-estrategia';
import { FacturasEnMemoria } from './facturas-en-memoria';
import { RegistrarCargoUseCase } from './registrar-cargo.use-case';

/** p-prepaga tiene prepaga 70%, p-publica obra social pública, p-sin no tiene cobertura. */
const pacientes = {
  findById: async (id: string) =>
    ({ 'p-prepaga': { id, coberturaId: 'c-prepaga' }, 'p-publica': { id, coberturaId: 'c-publica' }, 'p-sin': { id, coberturaId: null }, 'p-art': { id, coberturaId: 'c-art' } } as Record<string, object>)[id] ?? null,
} as unknown as IPacienteRepository;

function armar() {
  const repo = new FacturasEnMemoria();
  repo.agregarCobertura('c-prepaga', 'prepaga', '70.00');
  repo.agregarCobertura('c-publica', 'publica', '100.00');
  repo.agregarCobertura('c-particular', 'particular', '0.00');
  repo.agregarCobertura('c-art', 'art', '100.00'); // sin estrategia implementada
  const resolver = new ResolverEstrategiaCobertura([new CoberturaPublica(), new CoberturaPrepaga(), new CoberturaParticular()]);
  return { repo, useCase: new RegistrarCargoUseCase(repo, pacientes, resolver) };
}

describe('RegistrarCargoUseCase', () => {
  it('acumula líneas en la misma factura y recalcula con la prepaga al 70%', async () => {
    const { repo, useCase } = armar();

    await useCase.ejecutar({ pacienteId: 'p-prepaga', concepto: 'Medicación: Ampolla', cantidad: 2, precioUnitario: '1500.00' });
    const factura = await useCase.ejecutar({ pacienteId: 'p-prepaga', concepto: 'Medicación: Suero', cantidad: 1, precioUnitario: '1000.00' });

    // base = 2 x 1500 + 1000 = 4000 -> cubierto 2800, paciente 1200
    expect(factura.montoCubierto).toBe('2800.00');
    expect(factura.total).toBe('1200.00');
    expect(repo.facturas).toHaveLength(1);
    expect(await repo.lineasDe(factura.id)).toHaveLength(2);
  });

  it('obra social pública: el paciente no paga nada', async () => {
    const factura = await armar().useCase.ejecutar({ pacienteId: 'p-publica', concepto: 'Consulta', cantidad: 1, precioUnitario: '15000' });

    expect(factura).toMatchObject({ total: '0.00', montoCubierto: '15000.00' });
  });

  it('un paciente sin cobertura factura como particular', async () => {
    const factura = await armar().useCase.ejecutar({ pacienteId: 'p-sin', concepto: 'Consulta', cantidad: 1, precioUnitario: '120.50' });

    expect(factura.cobertura.tipo).toBe('particular');
    expect(factura).toMatchObject({ total: '120.50', montoCubierto: '0.00' });
  });

  it('si la factura anterior ya se emitió, el cargo nuevo abre otra', async () => {
    const { repo, useCase } = armar();
    const primera = await useCase.ejecutar({ pacienteId: 'p-sin', concepto: 'A', cantidad: 1, precioUnitario: '10' });
    await repo.cambiarEstado(primera.id, 'pendiente', 'emitida');

    const segunda = await useCase.ejecutar({ pacienteId: 'p-sin', concepto: 'B', cantidad: 1, precioUnitario: '10' });

    expect(segunda.id).not.toBe(primera.id);
  });

  it('una cobertura sin estrategia da 422 y no deja una línea suelta', async () => {
    const { repo, useCase } = armar();

    await expect(
      useCase.ejecutar({ pacienteId: 'p-art', concepto: 'Consulta', cantidad: 1, precioUnitario: '100' }),
    ).rejects.toBeInstanceOf(DomainException);
    expect(repo.lineas).toHaveLength(0);
  });

  it('rechaza datos inválidos y pacientes inexistentes', async () => {
    const { useCase } = armar();

    await expect(useCase.ejecutar({ pacienteId: 'p-sin', concepto: 'x', cantidad: 0, precioUnitario: '10' })).rejects.toThrow('entero positivo');
    await expect(useCase.ejecutar({ pacienteId: 'p-sin', concepto: ' ', cantidad: 1, precioUnitario: '10' })).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.ejecutar({ pacienteId: 'p-sin', concepto: 'x', cantidad: 1, precioUnitario: '-5' })).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.ejecutar({ pacienteId: 'p-nadie', concepto: 'x', cantidad: 1, precioUnitario: '10' })).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });
});
