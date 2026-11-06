import { httpClient } from '../../../shared/http/http-client';

export interface Cobertura {
  id: string;
  nombre: string;
  tipo: string;
  porcentajeCobertura: string;
}

export type EstadoFactura = 'pendiente' | 'emitida' | 'pagada' | 'anulada';
export type AccionFactura = 'emitir' | 'pagar' | 'anular';

export interface Factura {
  id: string;
  pacienteId: string;
  cobertura: Cobertura;
  /** Lo que paga el paciente. */
  total: string;
  /** Lo que absorbe la cobertura. */
  montoCubierto: string;
  estado: EstadoFactura;
  emitidaEn: string;
}

export interface LineaFactura {
  id: string;
  concepto: string;
  cantidad: number;
  precioUnitario: string;
}

export interface EventoPendiente {
  id: string;
  tipo: string;
  payload: Record<string, unknown>;
  creadoEn: string;
}

export const facturacionApi = {
  async coberturas(): Promise<Cobertura[]> {
    const { data } = await httpClient.get<Cobertura[]>('/facturacion/coberturas');
    return data;
  },
  async crearCobertura(nombre: string, tipo: string, porcentajeCobertura: number) {
    await httpClient.post('/facturacion/coberturas', { nombre, tipo, porcentajeCobertura });
  },
  async asignarCobertura(pacienteId: string, coberturaId: string) {
    await httpClient.patch(`/facturacion/pacientes/${pacienteId}/cobertura`, { coberturaId });
  },
  async facturasDe(pacienteId: string): Promise<Factura[]> {
    const { data } = await httpClient.get<Factura[]>(`/facturacion/pacientes/${pacienteId}/facturas`);
    return data;
  },
  async detalle(facturaId: string): Promise<{ factura: Factura; lineas: LineaFactura[] }> {
    const { data } = await httpClient.get<{ factura: Factura; lineas: LineaFactura[] }>(`/facturacion/facturas/${facturaId}`);
    return data;
  },
  async cargoManual(pacienteId: string, concepto: string, cantidad: number, precioUnitario: string) {
    await httpClient.post(`/facturacion/pacientes/${pacienteId}/cargos`, { concepto, cantidad, precioUnitario });
  },
  async cambiarEstado(facturaId: string, accion: AccionFactura) {
    await httpClient.patch(`/facturacion/facturas/${facturaId}/${accion}`);
  },
  async eventosPendientes(): Promise<EventoPendiente[]> {
    const { data } = await httpClient.get<EventoPendiente[]>('/facturacion/eventos-pendientes');
    return data;
  },
};
