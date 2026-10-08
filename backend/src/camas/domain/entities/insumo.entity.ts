import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  unidad: string;

  // Lo que se factura por cada unidad administrada (numeric llega como string).
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  precioUnitario: string;

  // Debajo de este stock se dispara la alerta de reposición.
  @Column({ type: 'int', default: 0 })
  umbralMinimo: number;
}
