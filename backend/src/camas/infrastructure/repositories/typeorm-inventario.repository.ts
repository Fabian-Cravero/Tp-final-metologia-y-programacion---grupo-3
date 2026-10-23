import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from '../../domain/entities/insumo.entity';
import { StockInsumo } from '../../domain/entities/stock-insumo.entity';
import {
  type IInventarioRepository,
  type InsumoConStock,
} from '../../domain/repositories/inventario-repository.interface';

@Injectable()
export class TypeOrmInventarioRepository implements IInventarioRepository {
  constructor(
    @InjectRepository(Insumo) private readonly insumos: Repository<Insumo>,
    @InjectRepository(StockInsumo) private readonly stock: Repository<StockInsumo>,
  ) {}

  findInsumo(id: string) {
    return this.insumos.findOneBy({ id });
  }

  crearInsumo(datos: { nombre: string; unidad: string; umbralMinimo: number; precioUnitario: string }) {
    return this.insumos.save(this.insumos.create(datos));
  }

  async ingresarStock(insumoId: string, cantidad: number, ubicacion?: string) {
    await this.stock.save(
      this.stock.create({ insumo: { id: insumoId }, cantidad, ubicacion: ubicacion ?? null }),
    );
  }

  async descontar(insumoId: string, cantidad: number) {
    const filas = await this.stock.find({
      where: { insumo: { id: insumoId } },
      order: { cantidad: 'DESC' },
    });

    for (const fila of filas) {
      const r = await this.stock
        .createQueryBuilder()
        .update(StockInsumo)
        .set({ cantidad: () => 'cantidad - :n' })
        .where('id = :id AND cantidad >= :n', { id: fila.id, n: cantidad })
        .execute();
      if (r.affected === 1) return true;   // si otro se llevó el stock, prueba con la siguiente ubicación
    }
    return false;
  }

  async stockTotal(insumoId: string) {
    const fila = await this.stock
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.cantidad), 0)', 'total')
      .where('s."insumoId" = :insumoId', { insumoId })
      .getRawOne<{ total: string }>();
    return Number(fila?.total ?? 0);
  }

  async listarInsumos(): Promise<InsumoConStock[]> {
    const insumos = await this.insumos.find({ order: { nombre: 'ASC' } });
    const sumas = await this.stock
      .createQueryBuilder('s')
      .select('s."insumoId"', 'insumoId')
      .addSelect('COALESCE(SUM(s.cantidad), 0)', 'total')
      .groupBy('s."insumoId"')
      .getRawMany<{ insumoId: string; total: string }>();

    const totalPorInsumo = new Map(sumas.map((f) => [f.insumoId, Number(f.total)]));
    return insumos.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      unidad: i.unidad,
      umbralMinimo: i.umbralMinimo,
      precioUnitario: i.precioUnitario,
      stockTotal: totalPorInsumo.get(i.id) ?? 0,
    }));
  }
}
