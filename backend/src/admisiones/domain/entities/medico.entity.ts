import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  matricula: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  especialidad: string;

  @Column({ default: true })
  activo: boolean;
}
