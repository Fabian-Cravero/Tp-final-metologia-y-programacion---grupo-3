import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historias_clinicas')
export class HistoriaClinica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Paciente vive en Admisiones: solo se guarda su id para no acoplar módulos.
  @Column({ type: 'uuid', unique: true })
  pacienteId: string;

  @Column({ type: 'varchar', nullable: true })
  grupoSanguineo: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  creadaEn: Date;
}
