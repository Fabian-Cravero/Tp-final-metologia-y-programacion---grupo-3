import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HistoriaClinica } from './historia-clinica.entity';

@Entity('antecedentes_familiares')
export class AntecedenteFamiliar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HistoriaClinica, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historiaClinicaId' })
  historiaClinica: HistoriaClinica;

  @Column()
  parentesco: string;

  @Column({ type: 'text' })
  descripcion: string;
}
