import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';
import { RolUsuario } from '../enums/rol.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // Hash de la contraseña (bcrypt). La lógica de hasheo se agrega junto
  // con el caso de uso de registro/login en la Fase 1.
  @Column()
  passwordHash: string;

  @Column()
  nombre: string;

  @Column({ type: 'varchar' })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @VersionColumn()
  version: number;
}
