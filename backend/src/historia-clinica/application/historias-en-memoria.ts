import { Alergia } from '../domain/entities/alergia.entity';
import { AntecedenteFamiliar } from '../domain/entities/antecedente-familiar.entity';
import { Evolucion } from '../domain/entities/evolucion.entity';
import { HistoriaClinica } from '../domain/entities/historia-clinica.entity';
import { type IHistoriaClinicaRepository } from '../domain/repositories/historia-clinica-repository.interface';

/** Repositorio en memoria para probar los casos de uso sin base de datos. */
export class HistoriasEnMemoria implements IHistoriaClinicaRepository {
  readonly historias: HistoriaClinica[] = [];
  readonly alergias: { historiaId: string; alergia: Alergia }[] = [];
  readonly antecedentes: { historiaId: string; antecedente: AntecedenteFamiliar }[] = [];
  readonly evoluciones: { historiaId: string; evolucion: Evolucion }[] = [];

  async findByPaciente(pacienteId: string) {
    return this.historias.find((h) => h.pacienteId === pacienteId) ?? null;
  }

  async crear(pacienteId: string, grupoSanguineo: string | null) {
    const historia = Object.assign(new HistoriaClinica(), {
      id: `h${this.historias.length + 1}`,
      pacienteId,
      grupoSanguineo,
      creadaEn: new Date(),
    });
    this.historias.push(historia);
    return historia;
  }

  async agregarAlergia(historiaId: string, sustancia: string, severidad: string) {
    const alergia = Object.assign(new Alergia(), { id: `a${this.alergias.length + 1}`, sustancia, severidad });
    this.alergias.push({ historiaId, alergia });
    return alergia;
  }

  async agregarAntecedente(historiaId: string, parentesco: string, descripcion: string) {
    const antecedente = Object.assign(new AntecedenteFamiliar(), {
      id: `f${this.antecedentes.length + 1}`,
      parentesco,
      descripcion,
    });
    this.antecedentes.push({ historiaId, antecedente });
    return antecedente;
  }

  async agregarEvolucion(historiaId: string, medicoId: string, nota: string) {
    const evolucion = Object.assign(new Evolucion(), {
      id: `e${this.evoluciones.length + 1}`,
      medicoId,
      nota,
      // Cada evolución un minuto después de la anterior, para poder probar el orden.
      fecha: new Date(2026, 0, 1, 10, this.evoluciones.length),
    });
    this.evoluciones.push({ historiaId, evolucion });
    return evolucion;
  }

  async listarAlergias(historiaId: string) {
    return this.alergias.filter((x) => x.historiaId === historiaId).map((x) => x.alergia);
  }

  async listarAntecedentes(historiaId: string) {
    return this.antecedentes.filter((x) => x.historiaId === historiaId).map((x) => x.antecedente);
  }

  async listarEvoluciones(historiaId: string, limite: number) {
    return this.evoluciones
      .filter((x) => x.historiaId === historiaId)
      .map((x) => x.evolucion)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, limite);
  }
}
