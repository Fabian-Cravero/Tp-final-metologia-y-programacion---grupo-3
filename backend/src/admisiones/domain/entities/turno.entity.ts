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

  // HU 1.2: los turnos duran 30 minutos, salvo que un entreturno le quite tiempo al anterior.
  @Column({ type: 'int', default: 30 })
  duracionMinutos: number;

  // HU 1.2: true si este turno es un entreturno insertado entre dos turnos.
  @Column({ default: false })
  esEntreturno: boolean;

  // HU 1.2: true si un entreturno le quitó tiempo a este turno (se avisa al médico en la agenda).
  @Column({ default: false })
  duracionReducida: boolean;

  // Control de concurrencia optimista desde el primer día (sección 06 del informe).
  @VersionColumn()
  version: number;
}
