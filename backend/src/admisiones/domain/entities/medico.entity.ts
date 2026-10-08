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

  // Usuario (IAM) con el que el médico inicia sesión.
  @Column({ type: 'uuid', nullable: true, unique: true })
  usuarioId: string | null;

  @Column({ default: true })
  activo: boolean;
}
