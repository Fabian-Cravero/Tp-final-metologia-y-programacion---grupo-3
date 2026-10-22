import { Inject, Injectable } from '@nestjs/common';
import { CAMA_REPOSITORY, type ICamaRepository } from '../domain/repositories/cama-repository.interface';

export interface SectorDeCamas {
  sector: string;
  libres: number;
  camas: { id: string; codigo: string; estado: string }[];
}

@Injectable()
export class ObtenerMapaCamasUseCase {
  constructor(@Inject(CAMA_REPOSITORY) private readonly camas: ICamaRepository) {}

  async ejecutar(): Promise<SectorDeCamas[]> {
    const porSector = new Map<string, SectorDeCamas>();

    for (const cama of await this.camas.listar()) {
      const sector = porSector.get(cama.sector) ?? { sector: cama.sector, libres: 0, camas: [] };
      sector.camas.push({ id: cama.id, codigo: cama.codigo, estado: cama.estado });
      if (cama.estado === 'libre') sector.libres += 1;
      porSector.set(cama.sector, sector);
    }
    return [...porSector.values()];
  }
}
