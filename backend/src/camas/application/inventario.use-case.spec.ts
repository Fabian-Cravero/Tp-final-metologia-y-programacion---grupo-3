import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Insumo } from '../domain/entities/insumo.entity';
import {
  type IInventarioRepository,
  type InsumoConStock,
} from '../domain/repositories/inventario-repository.interface';
import { CrearInsumoUseCase } from './crear-insumo.use-case';
import { IngresarStockUseCase } from './ingresar-stock.use-case';
import { ListarInsumosUseCase } from './listar-insumos.use-case';

class InventarioEnMemoria implements IInventarioRepository {
  readonly ingresos: { insumoId: string; cantidad: number; ubicacion?: string }[] = [];
  readonly insumo = Object.assign(new Insumo(), { id: 'i1', nombre: 'Gasas', umbralMinimo: 5 });

  async findInsumo(id: string) { return id === 'i1' ? this.insumo : null; }
  async crearInsumo(d: { nombre: string; unidad: string; umbralMinimo: number; precioUnitario: string }) {
    return Object.assign(new Insumo(), { id: 'nuevo', ...d });
  }
  async ingresarStock(insumoId: string, cantidad: number, ubicacion?: string) {
    this.ingresos.push({ insumoId, cantidad, ubicacion });
  }
  async descontar() { return true; }
  async stockTotal() { return 0; }
  async listarInsumos(): Promise<InsumoConStock[]> {
    return [{ id: 'i1', nombre: 'Gasas', unidad: 'caja', umbralMinimo: 5, precioUnitario: '10.00', stockTotal: 12 }];
  }
}

describe('Casos de uso de inventario', () => {
  it('crea un insumo limpiando espacios', async () => {
    const insumo = await new CrearInsumoUseCase(new InventarioEnMemoria()).ejecutar({
      nombre: ' Gasas ', unidad: ' caja ', umbralMinimo: 5, precioUnitario: '10.00',
    });

    expect(insumo.nombre).toBe('Gasas');
    expect(insumo.unidad).toBe('caja');
  });

  it('rechaza un insumo sin nombre o con umbral negativo', async () => {
    const useCase = new CrearInsumoUseCase(new InventarioEnMemoria());

    await expect(
      useCase.ejecutar({ nombre: '', unidad: 'caja', umbralMinimo: 1, precioUnitario: '1' }),
    ).rejects.toBeInstanceOf(DomainException);
    await expect(
      useCase.ejecutar({ nombre: 'Gasas', unidad: 'caja', umbralMinimo: -1, precioUnitario: '1' }),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('ingresa stock en una ubicación', async () => {
    const repo = new InventarioEnMemoria();

    await new IngresarStockUseCase(repo).ejecutar('i1', 10, 'Depósito');

    expect(repo.ingresos).toEqual([{ insumoId: 'i1', cantidad: 10, ubicacion: 'Depósito' }]);
  });

  it('rechaza cantidades inválidas y insumos inexistentes', async () => {
    const useCase = new IngresarStockUseCase(new InventarioEnMemoria());

    await expect(useCase.ejecutar('i1', 0)).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.ejecutar('i1', 2.5)).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.ejecutar('nada', 5)).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });

  it('lista los insumos con su stock total', async () => {
    const lista = await new ListarInsumosUseCase(new InventarioEnMemoria()).ejecutar();

    expect(lista[0].stockTotal).toBe(12);
  });
});
