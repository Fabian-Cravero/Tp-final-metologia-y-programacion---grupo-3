import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Outbox de eventos de dominio: guarda cada evento antes de publicarlo, así
 * la integración Inventario -> Facturación no se pierde si algo falla a mitad.
 */
@Entity('eventos_dominio')
export class EventoDominio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tipo: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ default: false })
  procesado: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
