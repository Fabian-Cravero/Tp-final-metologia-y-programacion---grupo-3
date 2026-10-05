import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('indicaciones_medicas')
export class IndicacionMedica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @Column({ type: 'uuid' })
  medicoId: string;

  // medicacion | estudio | dieta | otro
  @Column()
  tipo: string;

  @Column({ type: 'text' })
  descripcion: string;

  // pendiente | cumplida | cancelada
  @Column({ type: 'varchar', default: 'pendiente' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz' })
  creadaEn: Date;
}
