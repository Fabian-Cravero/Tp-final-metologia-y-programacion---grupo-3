import { type IPacienteRepository } from '../../../admisiones/domain/repositories/paciente-repository.interface';
import { EVENTOS, type MedicacionAdministradaPayload } from '../../../shared/events/eventos';
import { RegistrarCargoUseCase } from '../../application/registrar-cargo.use-case';
import { FacturasEnMemoria } from '../../application/facturas-en-memoria';
import { EventoDominio } from '../../domain/entities/evento-dominio.entity';
import { CoberturaParticular } from '../../domain/estrategias/cobertura-particular';
import { CoberturaPrepaga } from '../../domain/estrategias/cobertura-prepaga';
import { ResolverEstrategiaCobertura } from '../../domain/estrategias/resolver-estrategia';
import { type IEventoDominioRepository } from '../../domain/repositories/evento-dominio-repository.interface';
import { MedicacionAdministradaListener } from './medicacion-administrada.listener';

class EventosEnMemoria implements IEventoDominioRepository {
  readonly eventos: EventoDominio[] = [];
  async registrar(tipo: string, payload: Record<string, unknown>) {
    const e = Object.assign(new EventoDominio(), { id: `ev${this.eventos.length + 1}`, tipo, payload, procesado: false, creadoEn: new Date() });
    this.eventos.push(e);
    return e;
  }
  async marcarProcesado(id: string) {
    const e = this.eventos.find((x) => x.id === id);
    if (e) e.procesado = true;
  }
  async existeProcesado(tipo: string, indicacionId: string) {
    return this.eventos.some((e) => e.tipo === tipo && e.procesado && e.payload.indicacionId === indicacionId);
  }
  async listarPendientes() { return this.eventos.filter((e) => !e.procesado); }
}

const payload: MedicacionAdministradaPayload = {
  indicacionId: 'ind1',
  pacienteId: 'p1',
  insumoId: 'i1',
  concepto: 'Medicación: Ampolla paracetamol',
  cantidad: 2,
  precioUnitario: '120.50',
};

function armar(pacienteExiste = true) {
  const facturas = new FacturasEnMemoria();
  facturas.agregarCobertura('c-prepaga', 'prepaga', '70.00');
  const pacientes = {
    findById: async (id: string) => (pacienteExiste && id === 'p1' ? { id, coberturaId: 'c-prepaga' } : null),
  } as unknown as IPacienteRepository;
  const resolver = new ResolverEstrategiaCobertura([new CoberturaPrepaga(), new CoberturaParticular()]);
  const eventos = new EventosEnMemoria();
  const listener = new MedicacionAdministradaListener(new RegistrarCargoUseCase(facturas, pacientes, resolver), eventos);
  return { facturas, eventos, listener };
}

describe('MedicacionAdministradaListener', () => {
  it('genera el cargo en la factura del paciente y deja el evento procesado', async () => {
    const { facturas, eventos, listener } = armar();

    await listener.manejar(payload);

    expect(facturas.facturas).toHaveLength(1);
    // base 2 x 120.50 = 241.00 -> prepaga 70%: cubierto 168.70, paciente 72.30
    expect(facturas.facturas[0]).toMatchObject({ montoCubierto: '168.70', total: '72.30' });
    expect(eventos.eventos).toEqual([expect.objectContaining({ tipo: EVENTOS.MEDICACION_ADMINISTRADA, procesado: true })]);
  });

  it('el mismo evento dos veces no se cobra dos veces', async () => {
    const { facturas, eventos, listener } = armar();

    await listener.manejar(payload);
    await listener.manejar(payload);

    expect(await facturas.lineasDe(facturas.facturas[0].id)).toHaveLength(1);
    expect(eventos.eventos).toHaveLength(1);
  });

  it('si el cargo falla, el evento queda sin procesar y el error no se propaga', async () => {
    const { facturas, eventos, listener } = armar(false);

    await expect(listener.manejar(payload)).resolves.toBeUndefined();

    expect(facturas.facturas).toHaveLength(0);
    expect(await eventos.listarPendientes()).toHaveLength(1);
  });
});
