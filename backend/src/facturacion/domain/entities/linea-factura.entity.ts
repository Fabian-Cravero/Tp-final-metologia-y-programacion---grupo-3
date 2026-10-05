import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Factura } from './factura.entity';

@Entity('lineas_factura')
export class LineaFactura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Factura, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facturaId' })
  factura: Factura;

  @Column()
  concepto: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precioUnitario: string;
}
