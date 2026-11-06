import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { Paciente } from '../../admisiones/domain/entities/paciente.entity';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { CoberturasUseCase } from './coberturas.use-case';
import { FacturasEnMemoria } from './facturas-en-memoria';

function armar() {
  const repo = new FacturasEnMemoria();
  repo.agregarCobertura('c-prepaga', 'prepaga', '70.00');
  const ana = Object.assign(new Paciente(), { id: 'p1', coberturaId: null });
  const pacientes = {
    findById: async (id: string) => (id === 'p1' ? ana : null),
    save: async (p: Paciente) => p,
  } as unknown as IPacienteRepository;
  return { repo, ana, useCase: new CoberturasUseCase(repo, pacientes) };
}

describe('CoberturasUseCase', () => {
  it('crea una cobertura con el porcentaje como texto de dos decimales', async () => {
    const c = await armar().useCase.crear({ nombre: ' ART Ejemplo ', tipo: 'ART', porcentajeCobertura: 100 });

    expect(c).toMatchObject({ nombre: 'ART Ejemplo', tipo: 'art', porcentajeCobertura: '100.00' });
  });

  it('rechaza un porcentaje fuera de 0..100 o un nombre vacío', async () => {
    const { useCase } = armar();

    await expect(useCase.crear({ nombre: 'X', tipo: 'prepaga', porcentajeCobertura: 120 })).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.crear({ nombre: ' ', tipo: 'prepaga', porcentajeCobertura: 50 })).rejects.toBeInstanceOf(DomainException);
  });

  it('asigna una cobertura existente al paciente', async () => {
    const { useCase, ana } = armar();

    await useCase.asignarAPaciente('p1', 'c-prepaga');

    expect(ana.coberturaId).toBe('c-prepaga');
  });

  it('paciente o cobertura inexistentes dan 404', async () => {
    const { useCase } = armar();

    await expect(useCase.asignarAPaciente('p9', 'c-prepaga')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
    await expect(useCase.asignarAPaciente('p1', 'c-nada')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });
});
