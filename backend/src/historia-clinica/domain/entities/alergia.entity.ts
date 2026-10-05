import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HistoriaClinica } from './historia-clinica.entity';

@Entity('alergias')
export class Alergia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HistoriaClinica, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historiaClinicaId' })
  historiaClinica: HistoriaClinica;

  @Column()
  sustancia: string;

  // leve | moderada | grave
  @Column({ type: 'varchar', default: 'leve' })
  severidad: string;
}
