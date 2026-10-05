import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('protocolos_cuidado')
export class ProtocoloCuidado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  // pre_operatorio | respiratorio | ... (lo arma el Builder más adelante)
  @Column()
  motivoIngreso: string;

  // activo | finalizado
  @Column({ type: 'varchar', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
