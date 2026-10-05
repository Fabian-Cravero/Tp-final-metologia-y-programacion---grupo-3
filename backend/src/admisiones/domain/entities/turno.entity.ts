import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Medico } from './medico.entity';
import { Paciente } from './paciente.entity';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, { nullable: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @ManyToOne(() => Medico, { nullable: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column({ type: 'timestamptz' })
  fechaHora: Date;

  // reservado | confirmado | en_atencion | atendido | cancelado (State pattern, más adelante)
  @Column({ type: 'varchar', default: 'reservado' })
  estado: string;

  // normal | urgente | codigo_rojo (triaje)
  @Column({ type: 'varchar', default: 'normal' })
  prioridad: string;

  @Column({ type: 'varchar', nullable: true })
  motivo: string | null;

  // Control de concurrencia optimista desde el primer día (sección 06 del informe).
  @VersionColumn()
  version: number;
}
