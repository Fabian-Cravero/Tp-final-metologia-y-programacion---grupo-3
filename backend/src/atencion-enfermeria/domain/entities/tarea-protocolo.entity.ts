import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProtocoloCuidado } from './protocolo-cuidado.entity';

@Entity('tareas_protocolo')
export class TareaProtocolo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProtocoloCuidado, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'protocoloId' })
  protocolo: ProtocoloCuidado;

  @Column()
  descripcion: string;

  @Column({ type: 'int' })
  orden: number;

  @Column({ default: false })
  completada: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completadaEn: Date | null;
}
