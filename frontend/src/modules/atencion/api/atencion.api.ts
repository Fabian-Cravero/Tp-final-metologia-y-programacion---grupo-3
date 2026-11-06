import { httpClient } from '../../../shared/http/http-client';

export type TipoSigno = 'frecuencia_cardiaca' | 'presion_sistolica' | 'temperatura' | 'saturacion_o2' | 'frecuencia_respiratoria';
export type Severidad = 'normal' | 'alerta' | 'critico';

export const TIPOS_SIGNO: { valor: TipoSigno; texto: string; unidad: string }[] = [
  { valor: 'frecuencia_cardiaca', texto: 'Frecuencia cardíaca', unidad: 'lpm' },
  { valor: 'presion_sistolica', texto: 'Presión sistólica', unidad: 'mmHg' },
  { valor: 'temperatura', texto: 'Temperatura', unidad: '°C' },
  { valor: 'saturacion_o2', texto: 'Saturación de O₂', unidad: '%' },
  { valor: 'frecuencia_respiratoria', texto: 'Frecuencia respiratoria', unidad: 'rpm' },
];

export interface SignoVital {
  id: string;
  tipo: TipoSigno;
  valor: string;
  unidad: string;
  registradoEn: string;
  severidad: Severidad;
}

export type TipoIndicacion = 'medicacion' | 'estudio' | 'dieta' | 'otro';

export interface Indicacion {
  id: string;
  tipo: TipoIndicacion;
  descripcion: string;
  insumoId: string | null;
  cantidad: number | null;
  estado: 'pendiente' | 'cumplida' | 'cancelada';
  creadaEn: string;
}

export interface NuevaIndicacion {
  tipo: TipoIndicacion;
  descripcion: string;
  insumoId?: string;
  cantidad?: number;
}

export type MotivoIngreso = 'pre_operatorio' | 'respiratorio';

export interface Protocolo { id: string; motivoIngreso: MotivoIngreso; estado: 'activo' | 'finalizado'; creadoEn: string }
export interface Tarea { id: string; descripcion: string; orden: number; completada: boolean; completadaEn: string | null }
export interface ProtocoloConTareas { protocolo: Protocolo; tareas: Tarea[] }

const paciente = (id: string) => `/atencion-enfermeria/pacientes/${id}`;

export const signosApi = {
  async historial(pacienteId: string): Promise<SignoVital[]> {
    const { data } = await httpClient.get<SignoVital[]>(`${paciente(pacienteId)}/signos-vitales`);
    return data;
  },
  async registrar(pacienteId: string, tipo: TipoSigno, valor: number): Promise<{ severidad: Severidad }> {
    const { data } = await httpClient.post<{ severidad: Severidad }>(`${paciente(pacienteId)}/signos-vitales`, { tipo, valor });
    return data;
  },
};

export const indicacionesApi = {
  async pendientes(pacienteId: string): Promise<Indicacion[]> {
    const { data } = await httpClient.get<Indicacion[]>(`${paciente(pacienteId)}/indicaciones`);
    return data;
  },
  async crear(pacienteId: string, indicacion: NuevaIndicacion) {
    await httpClient.post(`${paciente(pacienteId)}/indicaciones`, indicacion);
  },
  async cumplir(id: string) {
    await httpClient.patch(`/atencion-enfermeria/indicaciones/${id}/cumplir`);
  },
  async cancelar(id: string) {
    await httpClient.patch(`/atencion-enfermeria/indicaciones/${id}/cancelar`);
  },
};

export const protocolosApi = {
  async delPaciente(pacienteId: string): Promise<Protocolo[]> {
    const { data } = await httpClient.get<Protocolo[]>(`${paciente(pacienteId)}/protocolos`);
    return data;
  },
  async iniciar(pacienteId: string, motivoIngreso: MotivoIngreso): Promise<ProtocoloConTareas> {
    const { data } = await httpClient.post<ProtocoloConTareas>(`${paciente(pacienteId)}/protocolos`, { motivoIngreso });
    return data;
  },
  async conTareas(protocoloId: string): Promise<ProtocoloConTareas> {
    const { data } = await httpClient.get<ProtocoloConTareas>(`/atencion-enfermeria/protocolos/${protocoloId}/tareas`);
    return data;
  },
  async completarTarea(tareaId: string) {
    await httpClient.patch(`/atencion-enfermeria/tareas/${tareaId}/completar`);
  },
};
