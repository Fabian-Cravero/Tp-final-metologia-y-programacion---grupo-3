import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cobertura } from './cobertura.entity';

@Entity('facturas')
// Una sola factura abierta por paciente: si dos cargos llegan juntos, la base no deja abrir dos.
@Index('uq_factura_pendiente_paciente', ['pacienteId'], { unique: true, where: `"estado" = 'pendiente'` })
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
