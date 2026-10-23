import { DomainException } from '../../shared/exceptions/domain.exception';
import { CamasEnMemoria } from './camas-en-memoria';
import { CrearCamaUseCase } from './crear-cama.use-case';

describe('CrearCamaUseCase', () => {
  it('crea la cama libre limpiando espacios', async () => {
    const cama = await new CrearCamaUseCase(new CamasEnMemoria()).ejecutar(' A-101 ', ' Clínica ');

    expect(cama.codigo).toBe('A-101');
    expect(cama.sector).toBe('Clínica');
    expect(cama.estado).toBe('libre');
  });

  it('rechaza un código o sector vacío', async () => {
    const useCase = new CrearCamaUseCase(new CamasEnMemoria());

    await expect(useCase.ejecutar('  ', 'Clínica')).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.ejecutar('A-1', '')).rejects.toBeInstanceOf(DomainException);
  });

  it('rechaza un código repetido', async () => {
    const useCase = new CrearCamaUseCase(new CamasEnMemoria());
    await useCase.ejecutar('A-1', 'Clínica');

    await expect(useCase.ejecutar('A-1', 'Clínica')).rejects.toBeInstanceOf(DomainException);
  });
});
