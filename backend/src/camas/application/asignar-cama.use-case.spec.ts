import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
  TransicionInvalidaException,
} from '../../shared/exceptions/domain.exception';
import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { AsignarCamaUseCase } from './asignar-cama.use-case';
import { CamasEnMemoria } from './camas-en-memoria';

const pacientes = {
  findById: async (id: string) => (id.startsWith('p') ? { id } : null),
} as unknown as IPacienteRepository;

describe('AsignarCamaUseCase', () => {
  let camas: CamasEnMemoria;
  let useCase: AsignarCamaUseCase;

  beforeEach(() => {
    camas = new CamasEnMemoria();
    useCase = new AsignarCamaUseCase(camas, pacientes);
  });

  it('asigna una cama libre y la deja ocupada', async () => {
    const cama = camas.agregar();

    const asignacion = await useCase.ejecutar(cama.id, 'p1');

    expect(asignacion.pacienteId).toBe('p1');
    expect(camas.camas.get(cama.id)?.estado).toBe('ocupada');
  });

  it('rechaza asignar una cama que ya está ocupada (422)', async () => {
    const cama = camas.agregar();
    await useCase.ejecutar(cama.id, 'p1');

    await expect(useCase.ejecutar(cama.id, 'p2')).rejects.toBeInstanceOf(TransicionInvalidaException);
  });

  it('un paciente no puede tener dos camas a la vez', async () => {
    const a = camas.agregar();
    const b = camas.agregar();
    await useCase.ejecutar(a.id, 'p1');

    await expect(useCase.ejecutar(b.id, 'p1')).rejects.toBeInstanceOf(DomainException);
  });

  it('si otra persona ocupó la cama entre la lectura y el UPDATE responde conflicto (409)', async () => {
    const cama = camas.agregar();
    camas.perderCarrera = true;

    await expect(useCase.ejecutar(cama.id, 'p1')).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });

  it('responde recurso no encontrado si la cama o el paciente no existen', async () => {
    const cama = camas.agregar();

    await expect(useCase.ejecutar('inexistente', 'p1')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
    await expect(useCase.ejecutar(cama.id, 'x9')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });
});
