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

  // Solo para tipo 'medicacion': qué insumo se descuenta y cuántas unidades.
  @Column({ type: 'uuid', nullable: true })
  insumoId: string | null;

  @Column({ type: 'int', nullable: true })
  cantidad: number | null;

  // pendiente | cumplida | cancelada
  @Column({ type: 'varchar', default: 'pendiente' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz' })
  creadaEn: Date;
}
