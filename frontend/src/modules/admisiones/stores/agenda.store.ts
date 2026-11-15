import { defineStore } from 'pinia';
import { mensajeDeError } from '../../../shared/http/errores';
import { hoyIso } from '../../../shared/formato';
import { medicosApi, turnosApi, type AccionTurno, type Medico, type NuevoTurno, type Turno } from '../api/admisiones.api';

/** Estado compartido de Admisiones: médicos, médico y día elegidos, y la agenda de ese día. */
export const useAgendaStore = defineStore('agenda', {
  state: () => ({
    medicos: [] as Medico[],
    medicoId: '',
    dia: hoyIso(),
    turnos: [] as Turno[],
    cargando: false,
    error: '',
  }),
  getters: {
    medicoElegido: (s) => s.medicos.find((m) => m.id === s.medicoId) ?? null,
  },
  actions: {
    async cargarMedicos(usuarioId?: string) {
      try {
        this.medicos = await medicosApi.listar();
        // Un médico que entra con su usuario ve su propia agenda de entrada.
        const propio = usuarioId ? this.medicos.find((m) => m.usuarioId === usuarioId) : undefined;
        if (!this.medicoId) this.medicoId = propio?.id ?? this.medicos[0]?.id ?? '';
      } catch (e) {
        this.error = mensajeDeError(e);
      }
    },
    async cargarAgenda() {
      if (!this.medicoId) return;
      this.cargando = true;
      this.error = '';
      try {
        this.turnos = await turnosApi.agenda(this.medicoId, this.dia);
      } catch (e) {
        this.error = mensajeDeError(e);
      } finally {
        this.cargando = false;
      }
    },
    /** Devuelve el mensaje de error, o null si salió bien. 409 = el horario ya está tomado. */
    async reservar(turno: NuevoTurno): Promise<string | null> {
      try {
        await turnosApi.reservar(turno);
        await this.cargarAgenda();
        return null;
      } catch (e) {
        return mensajeDeError(e);
      }
    },
    /** HU 1.2: igual que reservar, pero insertando un entreturno. */
    async insertarEntreturno(turno: NuevoTurno): Promise<string | null> {
      try {
        await turnosApi.insertarEntreturno(turno);
        await this.cargarAgenda(); // el turno anterior cambió de duración: se recarga todo
        return null;
      } catch (e) {
        return mensajeDeError(e);
      }
    },
    async cambiarEstado(id: string, accion: AccionTurno): Promise<string | null> {
      try {
        const actualizado = await turnosApi.cambiarEstado(id, accion);
        this.turnos = this.turnos.map((t) => (t.id === id ? { ...t, estado: actualizado.estado } : t));
        // HU 1.3: al cancelar, el backend puede darle el horario a alguien de la lista de espera.
        // Eso pasa por un evento, apenas después de responder: esperamos un momento y recargamos.
        if (accion === 'cancelar') setTimeout(() => void this.cargarAgenda(), 700);
        return null;
      } catch (e) {
        return mensajeDeError(e);
      }
    },
  },
});
