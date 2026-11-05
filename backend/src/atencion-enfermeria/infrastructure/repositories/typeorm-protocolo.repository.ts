import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProtocoloCuidado } from '../../domain/entities/protocolo-cuidado.entity';
import { TareaProtocolo } from '../../domain/entities/tarea-protocolo.entity';
import { type PlanProtocolo } from '../../domain/protocolos/protocolo.builder';
import { type IProtocoloRepository } from '../../domain/repositories/protocolo-repository.interface';

@Injectable()
export class TypeOrmProtocoloRepository implements IProtocoloRepository {
  constructor(
    @InjectRepository(ProtocoloCuidado) private readonly protocolos: Repository<ProtocoloCuidado>,
    @InjectRepository(TareaProtocolo) private readonly tareas: Repository<TareaProtocolo>,
    private readonly dataSource: DataSource,
  ) {}

  crearConTareas(pacienteId: string, plan: PlanProtocolo) {
    return this.dataSource.transaction(async (manager) => {
      const protocolo = await manager.save(
        manager.create(ProtocoloCuidado, { pacienteId, motivoIngreso: plan.motivoIngreso }),
      );
      await manager.save(
        plan.tareas.map((t) =>
          manager.create(TareaProtocolo, { protocolo: { id: protocolo.id }, descripcion: t.descripcion, orden: t.orden }),
        ),
      );
      return protocolo;
    });
  }

  findById(id: string) {
    return this.protocolos.findOneBy({ id });
  }

  listarDePaciente(pacienteId: string) {
    return this.protocolos.find({ where: { pacienteId }, order: { creadoEn: 'DESC' } });
  }

  tareasDe(protocoloId: string) {
    return this.tareas.find({ where: { protocolo: { id: protocoloId } }, order: { orden: 'ASC' } });
  }

  async completarTarea(tareaId: string) {
    const r = await this.tareas
      .createQueryBuilder()
      .update(TareaProtocolo)
      .set({ completada: true, completadaEn: () => 'now()' })
      .where('id = :tareaId AND completada = false', { tareaId })
      .execute();
    return r.affected === 1;
  }

  async protocoloDeTarea(tareaId: string) {
    const fila = await this.tareas
      .createQueryBuilder('t')
      .select('t."protocoloId"', 'protocoloId')
      .where('t.id = :tareaId', { tareaId })
      .getRawOne<{ protocoloId: string }>();
    return fila?.protocoloId ?? null;
  }

  contarPendientes(protocoloId: string) {
    return this.tareas.count({ where: { protocolo: { id: protocoloId }, completada: false } });
  }

  async finalizar(protocoloId: string) {
    await this.protocolos.update({ id: protocoloId }, { estado: 'finalizado' });
  }
}
