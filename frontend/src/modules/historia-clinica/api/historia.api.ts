import { httpClient } from '../../../shared/http/http-client';

export type Severidad = 'leve' | 'moderada' | 'grave';

export interface HistoriaClinica {
  id: string;
  pacienteId: string;
  grupoSanguineo: string | null;
  creadaEn: string;
}

export interface Alergia { id: string; sustancia: string; severidad: Severidad }
export interface Antecedente { id: string; parentesco: string; descripcion: string }
export interface FirmaMedico { id: string; nombre: string; apellido: string; matricula: string; especialidad: string }
export interface Evolucion { id: string; medicoId: string; nota: string; fecha: string; medico: FirmaMedico | null }

export interface HistoriaCompleta {
  historia: HistoriaClinica;
  alergias: Alergia[];
  antecedentes: Antecedente[];
  evoluciones: Evolucion[];
}

const base = (pacienteId: string) => `/historia-clinica/paciente/${pacienteId}`;

export const historiaApi = {
  async ver(pacienteId: string): Promise<HistoriaCompleta> {
    const { data } = await httpClient.get<HistoriaCompleta>(base(pacienteId));
    return data;
  },
  /** Idempotente: si ya existe, devuelve la misma. */
  async abrir(pacienteId: string, grupoSanguineo?: string): Promise<HistoriaClinica> {
    const { data } = await httpClient.post<HistoriaClinica>(base(pacienteId), grupoSanguineo ? { grupoSanguineo } : {});
    return data;
  },
  async agregarAlergia(pacienteId: string, sustancia: string, severidad: Severidad) {
    await httpClient.post(`${base(pacienteId)}/alergias`, { sustancia, severidad });
  },
  async agregarAntecedente(pacienteId: string, parentesco: string, descripcion: string) {
    await httpClient.post(`${base(pacienteId)}/antecedentes`, { parentesco, descripcion });
  },
  async agregarEvolucion(pacienteId: string, nota: string) {
    await httpClient.post(`${base(pacienteId)}/evoluciones`, { nota });
  },
};
