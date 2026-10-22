import { DomainException } from '../../shared/exceptions/domain.exception';
import { EVENTOS } from '../../shared/events/eventos';
import { Insumo } from '../domain/entities/insumo.entity';
import { type IInventarioRepository } from '../domain/repositories/inventario-repository.interface';
import { DescontarInsumoUseCase } from './descontar-insumo.use-case';

class InventarioEnMemoria implements IInventarioRepository {
  constructor(private stock: number, private readonly insumo: Insumo) {}
  async findInsumo() { return this.insumo; }
  async crearInsumo() { return this.insumo; }
  async ingresarStock() {}
  async descontar(_id: string, n: number) {
    if (this.stock < n) return false;
    this.stock -= n;
    return true;
  }
  async stockTotal() { return this.stock; }
}

describe('DescontarInsumoUseCase', () => {
  const insumo = Object.assign(new Insumo(), {
    id: 'i1', nombre: 'Ampolla paracetamol', umbralMinimo: 5, precioUnitario: '120.00',
  });

  it('no permite descontar más de lo que hay', async () => {
    const publicados: string[] = [];
    const useCase = new DescontarInsumoUseCase(new InventarioEnMemoria(3, insumo), {
      publicar: (e) => { publicados.push(e); },
    });

    await expect(useCase.ejecutar('i1', 10)).rejects.toThrow('Stock insuficiente');
    expect(publicados).toEqual([]);
  });

  it('publica una alerta cuando el stock cae bajo el umbral', async () => {
    const publicados: string[] = [];
    const useCase = new DescontarInsumoUseCase(new InventarioEnMemoria(8, insumo), {
      publicar: (e) => { publicados.push(e); },
    });

    const r = await useCase.ejecutar('i1', 4);   // quedan 4, el mínimo es 5

    expect(r).toEqual({ nombre: 'Ampolla paracetamol', precioUnitario: '120.00' });
    expect(publicados).toEqual([EVENTOS.STOCK_BAJO_UMBRAL]);
  });

  it('rechaza cantidades inválidas', async () => {
    const useCase = new DescontarInsumoUseCase(new InventarioEnMemoria(8, insumo), { publicar: () => {} });
    await expect(useCase.ejecutar('i1', 0)).rejects.toBeInstanceOf(DomainException);
    await expect(useCase.ejecutar('i1', 1.5)).rejects.toBeInstanceOf(DomainException);
  });
});
