import { httpClient } from '../../../shared/http/http-client';

export type EstadoCama = 'libre' | 'ocupada' | 'en_limpieza' | 'bloqueada';
export type AccionCama = 'liberar' | 'limpieza-confirmada' | 'bloquear' | 'habilitar';

export interface CamaEnMapa { id: string; codigo: string; estado: EstadoCama }
export interface SectorDeCamas { sector: string; libres: number; camas: CamaEnMapa[] }

export interface InsumoConStock {
  id: string;
  nombre: string;
  unidad: string;
  umbralMinimo: number;
  precioUnitario: string;
  stockTotal: number;
}

export interface NuevoInsumo {
  nombre: string;
  unidad: string;
  umbralMinimo: number;
  precioUnitario: string;
}

export const camasApi = {
  async mapa(): Promise<SectorDeCamas[]> {
    const { data } = await httpClient.get<SectorDeCamas[]>('/camas/mapa');
    return data;
  },
  async crear(codigo: string, sector: string) {
    await httpClient.post('/camas', { codigo, sector });
  },
  async asignar(camaId: string, pacienteId: string) {
    await httpClient.post(`/camas/${camaId}/asignar`, { pacienteId });
  },
  async accion(camaId: string, accion: AccionCama) {
    await httpClient.patch(`/camas/${camaId}/${accion}`);
  },
};

export const inventarioApi = {
  async listar(): Promise<InsumoConStock[]> {
    const { data } = await httpClient.get<InsumoConStock[]>('/camas/insumos');
    return data;
  },
  async crear(insumo: NuevoInsumo) {
    await httpClient.post('/camas/insumos', insumo);
  },
  async ingresarStock(insumoId: string, cantidad: number, ubicacion?: string) {
    await httpClient.post(`/camas/insumos/${insumoId}/stock`, ubicacion ? { cantidad, ubicacion } : { cantidad });
  },
};
