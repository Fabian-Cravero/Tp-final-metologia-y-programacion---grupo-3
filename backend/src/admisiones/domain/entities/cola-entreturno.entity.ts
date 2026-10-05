import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Medico } from './medico.entity';
import { Paciente } from './paciente.entity';

@Entity('cola_entreturno')
export class ColaEntreturno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, { nullable: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @ManyToOne(() => Medico, { nullable: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  // normal | urgente | codigo_rojo
  @Column({ type: 'varchar', default: 'normal' })
  prioridad: string;

  @Column({ default: false })
  atendido: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
