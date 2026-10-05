import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cama } from './cama.entity';

@Entity('asignaciones_cama')
export class AsignacionCama {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cama, { nullable: false })
  @JoinColumn({ name: 'camaId' })
  cama: Cama;

  // Paciente vive en Admisiones: solo se guarda su id.
  @Column({ type: 'uuid' })
  pacienteId: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  desde: Date;

  // null mientras la asignación siga vigente.
  @Column({ type: 'timestamptz', nullable: true })
  hasta: Date | null;
}
