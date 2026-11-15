import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Medico } from './medico.entity';
import { Paciente } from './paciente.entity';

export enum EstadoListaEspera {
  ESPERANDO = 'esperando',
  ASIGNADO = 'asignado',
}

/**
 * HU 1.3: lista de espera (standby) de un médico para un día.
 * No confundir con cola_entreturno, que es la sala de espera de guardia (triaje).
 */
// Un paciente no puede estar dos veces esperando al mismo médico el mismo día.
@Index('uq_lista_espera_paciente_activo', ['paciente', 'medico', 'dia'], {
  unique: true,
  where: `"estado" = 'esperando'`,
})
@Entity('lista_espera')
export class ListaEspera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, { nullable: false })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @ManyToOne(() => Medico, { nullable: false })
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  // Día buscado, 'AAAA-MM-DD' (columna date: sin hora ni zona horaria).
  @Column({ type: 'date' })
  dia: string;

  // esperando | asignado
  @Column({ type: 'varchar', default: EstadoListaEspera.ESPERANDO })
  estado: string;

  // Se completa cuando el sistema le asigna el turno de alguien que canceló.
  @Column({ type: 'uuid', nullable: true })
  turnoAsignadoId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  fechaHoraAsignada: Date | null;

  // false hasta que la recepcionista confirma que le avisó al paciente su nuevo horario.
  @Column({ default: false })
  avisado: boolean;

  // El orden de la lista es el orden de llegada.
  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
