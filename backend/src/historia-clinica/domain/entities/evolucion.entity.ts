import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HistoriaClinica } from './historia-clinica.entity';

@Entity('evoluciones')
export class Evolucion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HistoriaClinica, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historiaClinicaId' })
  historiaClinica: HistoriaClinica;

  // Médico vive en Admisiones: solo se guarda su id.
  @Column({ type: 'uuid' })
  medicoId: string;

  @Column({ type: 'text' })
  nota: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;
}
