import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('coberturas')
export class Cobertura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  // publica | prepaga | particular (Strategy de cálculo, más adelante)
  @Column()
  tipo: string;

  // numeric llega como string desde pg; se convierte al usarlo.
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  porcentajeCobertura: string;
}
