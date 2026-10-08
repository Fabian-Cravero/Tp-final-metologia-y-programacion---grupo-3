import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Medico } from './medico.entity';
import { Paciente } from './paciente.entity';

// Defensa real contra la doble reserva: un médico no puede tener dos turnos
// activos en el mismo horario. Un turno cancelado libera el horario.
@Index('uq_turno_medico_horario_activo', ['medico', 'fechaHora'], {
  unique: true,
  where: `"estado" <> 'cancelado'`,
})
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

  // programado | confirmado | en_sala_espera | atendido | cancelado (State pattern)
  @Column({ type: 'varchar', default: 'programado' })
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
