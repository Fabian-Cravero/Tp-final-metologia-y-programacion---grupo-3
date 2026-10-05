import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('signos_vitales')
export class SignoVital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  // Usuario (enfermero) que lo registró.
  @Column({ type: 'uuid' })
  registradoPorId: string;

  // frecuencia_cardiaca | presion_sistolica | temperatura | saturacion_o2 | ...
  @Column()
  tipo: string;

  // numeric llega como string desde pg; se convierte al usarlo.
  @Column({ type: 'numeric', precision: 8, scale: 2 })
  valor: string;

  @Column()
  unidad: string;

  @CreateDateColumn({ type: 'timestamptz' })
  registradoEn: Date;
}
