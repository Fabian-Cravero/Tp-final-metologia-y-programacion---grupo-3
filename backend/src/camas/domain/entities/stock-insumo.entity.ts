import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Insumo } from './insumo.entity';

@Entity('stock_insumos')
export class StockInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Insumo, { nullable: false })
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @Column({ type: 'int', default: 0 })
  cantidad: number;

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string | null;
}
