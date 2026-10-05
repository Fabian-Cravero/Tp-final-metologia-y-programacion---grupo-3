import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  unidad: string;

  // Debajo de este stock se dispara la alerta de reposición.
  @Column({ type: 'int', default: 0 })
  umbralMinimo: number;
}
