import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
  TransicionInvalidaException,
} from '../../shared/exceptions/domain.exception';
import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { AsignarCamaUseCase } from './asignar-cama.use-case';
import { CamasEnMemoria } from './camas-en-memoria';
import { ConfirmarLimpiezaUseCase } from './confirmar-limpieza.use-case';
import { LiberarCamaUseCase } from './liberar-cama.use-case';

const pacientes = { findById: async (id: string) => ({ id }) } as unknown as IPacienteRepository;

describe('LiberarCamaUseCase', () => {
  let camas: CamasEnMemoria;

  beforeEach(() => {
    camas = new CamasEnMemoria();
  });

  it('libera una cama ocupada: queda en limpieza y se cierra la asignación', async () => {
    const cama = camas.agregar();
    await new AsignarCamaUseCase(camas, pacientes).ejecutar(cama.id, 'p1');

    await new LiberarCamaUseCase(camas).ejecutar(cama.id);

    expect(camas.camas.get(cama.id)?.estado).toBe('en_limpieza');
    expect(camas.asignaciones[0].hasta).toBeInstanceOf(Date);
  });

  it('recién queda libre cuando se confirma la limpieza', async () => {
    const cama = camas.agregar();
    await new AsignarCamaUseCase(camas, pacientes).ejecutar(cama.id, 'p1');
    await new LiberarCamaUseCase(camas).ejecutar(cama.id);

    await new ConfirmarLimpiezaUseCase(camas).ejecutar(cama.id);

    expect(camas.camas.get(cama.id)?.estado).toBe('libre');
  });

  it('no se puede liberar una cama que está libre (422)', async () => {
    const cama = camas.agregar();

    await expect(new LiberarCamaUseCase(camas).ejecutar(cama.id)).rejects.toBeInstanceOf(
      TransicionInvalidaException,
    );
  });

  it('si otra petición modificó la cama responde conflicto (409)', async () => {
    const cama = camas.agregar({ estado: 'ocupada' });
    camas.perderCarrera = true;

    await expect(new LiberarCamaUseCase(camas).ejecutar(cama.id)).rejects.toBeInstanceOf(
      ConflictoDeConcurrenciaException,
    );
  });

  it('responde recurso no encontrado si la cama no existe', async () => {
    await expect(new LiberarCamaUseCase(camas).ejecutar('nada')).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });
});
