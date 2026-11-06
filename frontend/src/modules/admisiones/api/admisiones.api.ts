import { httpClient } from '../../../shared/http/http-client';

export interface Paciente {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string | null;
  email: string | null;
  coberturaId: string | null;
}

export interface NuevoPaciente {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
}

export interface Medico {
  id: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  usuarioId: string | null;
  activo: boolean;
}

export interface NuevoMedico {
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  usuarioId?: string;
}

export type EstadoTurno = 'programado' | 'confirmado' | 'en_sala_espera' | 'atendido' | 'cancelado';
export type AccionTurno = 'confirmar' | 'llegada' | 'atender' | 'cancelar';

export interface Turno {
  id: string;
  fechaHora: string;
  estado: EstadoTurno;
  motivo: string | null;
  paciente?: Paciente;
}

export interface NuevoTurno {
  pacienteId: string;
  medicoId: string;
  fechaHora: string;
  motivo?: string;
}

export type Prioridad = 'codigo_rojo' | 'urgente' | 'normal';

export interface EnCola {
  id: string;
  prioridad: Prioridad;
  atendido: boolean;
  creadoEn: string;
  paciente?: Paciente;
}

/** Saca los campos opcionales vacíos: el backend rechaza "" en un email o un teléfono. */
function sinVacios<T extends object>(datos: T): T {
  return Object.fromEntries(Object.entries(datos).filter(([, v]) => v !== '' && v !== undefined)) as T;
}

export const pacientesApi = {
  async buscar(q: string): Promise<Paciente[]> {
    const { data } = await httpClient.get<Paciente[]>('/admisiones/pacientes', { params: { q } });
    return data;
  },
  async registrar(paciente: NuevoPaciente): Promise<Paciente> {
    const { data } = await httpClient.post<Paciente>('/admisiones/pacientes', sinVacios(paciente));
    return data;
  },
};

export const medicosApi = {
  async listar(): Promise<Medico[]> {
    const { data } = await httpClient.get<Medico[]>('/admisiones/medicos');
    return data;
  },
  async registrar(medico: NuevoMedico): Promise<Medico> {
    const { data } = await httpClient.post<Medico>('/admisiones/medicos', sinVacios(medico));
    return data;
  },
};

export const turnosApi = {
  async agenda(medicoId: string, dia: string): Promise<Turno[]> {
    const { data } = await httpClient.get<Turno[]>('/admisiones/turnos', { params: { medicoId, dia } });
    return data;
  },
  async reservar(turno: NuevoTurno): Promise<Turno> {
    const { data } = await httpClient.post<Turno>('/admisiones/turnos', sinVacios(turno));
    return data;
  },
  async cambiarEstado(id: string, accion: AccionTurno): Promise<Turno> {
    const { data } = await httpClient.patch<Turno>(`/admisiones/turnos/${id}/${accion}`);
    return data;
  },
};

export const colaApi = {
  async listar(medicoId: string): Promise<EnCola[]> {
    const { data } = await httpClient.get<EnCola[]>('/admisiones/cola', { params: { medicoId } });
    return data;
  },
  async agregar(pacienteId: string, medicoId: string, prioridad: Prioridad): Promise<EnCola> {
    const { data } = await httpClient.post<EnCola>('/admisiones/cola', { pacienteId, medicoId, prioridad });
    return data;
  },
  async llamarSiguiente(medicoId: string): Promise<EnCola> {
    const { data } = await httpClient.post<EnCola>('/admisiones/cola/siguiente', null, { params: { medicoId } });
    return data;
  },
};
