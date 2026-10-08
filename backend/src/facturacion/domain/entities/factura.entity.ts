import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cobertura } from './cobertura.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Paciente vive en Admisiones: solo se guarda su id.
  @Column({ type: 'uuid' })
  pacienteId: string;

  @ManyToOne(() => Cobertura, { nullable: false })
  @JoinColumn({ name: 'coberturaId' })
  cobertura: Cobertura;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  // total = lo que paga el paciente; montoCubierto = lo que absorbe la cobertura.
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  montoCubierto: string;

  // pendiente | emitida | pagada | anulada
  @Column({ type: 'varchar', default: 'pendiente' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz' })
  emitidaEn: Date;
}
