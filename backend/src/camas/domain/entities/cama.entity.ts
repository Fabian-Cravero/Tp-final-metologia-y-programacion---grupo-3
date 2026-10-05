import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

@Entity('camas')
export class Cama {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  sector: string;

  // libre | ocupada | en_limpieza (State pattern, más adelante)
  @Column({ type: 'varchar', default: 'libre' })
  estado: string;

  // Control de concurrencia optimista desde el primer día (sección 06 del informe).
  @VersionColumn()
  version: number;
}
