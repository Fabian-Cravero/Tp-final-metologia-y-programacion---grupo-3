import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dni: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  // Cobertura vive en Facturación: se guarda solo el id para no acoplar módulos.
  @Column({ type: 'uuid', nullable: true })
  coberturaId: string | null;

  // Usuario (IAM) con el que el paciente inicia sesión. Solo el id: no se acoplan módulos.
  @Column({ type: 'uuid', nullable: true, unique: true })
  usuarioId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
