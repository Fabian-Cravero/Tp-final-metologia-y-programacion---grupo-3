import { type IMedicoRepository } from '../../admisiones/domain/repositories/medico-repository.interface';
import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { type DescontarInsumoUseCase } from '../../camas/application/descontar-insumo.use-case';
import { type IEventPublisher } from '../../shared/events/event-publisher.interface';
import { EVENTOS } from '../../shared/events/eventos';
import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
  TransicionInvalidaException,
} from '../../shared/exceptions/domain.exception';
import { CancelarIndicacionUseCase } from './cancelar-indicacion.use-case';
import { CumplirIndicacionUseCase } from './cumplir-indicacion.use-case';
import { IndicacionesEnMemoria } from './indicaciones-en-memoria';
import { IndicarUseCase } from './indicar.use-case';

const pacientes = { findById: async (id: string) => (id === 'p1' ? { id } : null) } as unknown as IPacienteRepository;
const medicos = {
  findByUsuarioId: async (u: string) => (u === 'u-medico' ? { id: 'm1' } : null),
} as unknown as IMedicoRepository;

function armar(opciones: { stockAlcanza: boolean } = { stockAlcanza: true }) {
  const repo = new IndicacionesEnMemoria();
  const publicados: { evento: string; payload: object }[] = [];
  const eventos: IEventPublisher = { publicar: (evento, payload) => { publicados.push({ evento, payload }); } };
  const descontar = {
    ejecutar: async () => {
      if (!opciones.stockAlcanza) throw new DomainException('Stock insuficiente de Ampolla paracetamol');
      return { nombre: 'Ampolla paracetamol', precioUnitario: '120.50' };
    },
  } as unknown as DescontarInsumoUseCase;

  return {
    repo,
    publicados,
    indicar: new IndicarUseCase(repo, pacientes, medicos),
    cumplir: new CumplirIndicacionUseCase(repo, descontar, eventos),
    cancelar: new CancelarIndicacionUseCase(repo),
  };
}

const medicacion = {
  pacienteId: 'p1',
  usuarioMedicoId: 'u-medico',
  tipo: 'medicacion',
  descripcion: 'Paracetamol 1 g',
  insumoId: 'i1',
  cantidad: 2,
};

describe('IndicarUseCase', () => {
  it('el médico se resuelve desde el usuario logueado', async () => {
    const { indicar } = armar();

    const ind = await indicar.ejecutar(medicacion);

    expect(ind).toMatchObject({ medicoId: 'm1', estado: 'pendiente', insumoId: 'i1', cantidad: 2 });
  });

  it('una medicación sin insumo o sin cantidad es inválida', async () => {
    const { indicar } = armar();

    await expect(indicar.ejecutar({ ...medicacion, insumoId: undefined })).rejects.toBeInstanceOf(DomainException);
    await expect(indicar.ejecutar({ ...medicacion, cantidad: undefined })).rejects.toBeInstanceOf(DomainException);
  });

  it('un estudio no guarda insumo ni cantidad', async () => {
    const { indicar } = armar();

    const ind = await indicar.ejecutar({ ...medicacion, tipo: 'estudio', descripcion: 'Radiografía de tórax' });

    expect(ind).toMatchObject({ tipo: 'estudio', insumoId: null, cantidad: null });
  });

  it('falla si el usuario no es un médico registrado o el paciente no existe', async () => {
    const { indicar } = armar();

    await expect(indicar.ejecutar({ ...medicacion, usuarioMedicoId: 'otro' })).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
    await expect(indicar.ejecutar({ ...medicacion, pacienteId: 'p9' })).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });
});

describe('CumplirIndicacionUseCase', () => {
  it('marca la indicación, descuenta el stock y publica MedicacionAdministrada', async () => {
    const { indicar, cumplir, repo, publicados } = armar();
    const ind = await indicar.ejecutar(medicacion);

    const r = await cumplir.ejecutar(ind.id);

    expect(r).toEqual({
      indicacionId: ind.id,
      estado: 'cumplida',
      insumoDescontado: { nombre: 'Ampolla paracetamol', cantidad: 2 },
    });
    expect(repo.estadoDe(ind.id)).toBe('cumplida');
    expect(publicados).toHaveLength(1);
    expect(publicados[0].evento).toBe(EVENTOS.MEDICACION_ADMINISTRADA);
    expect(publicados[0].payload).toMatchObject({
      indicacionId: ind.id,
      pacienteId: 'p1',
      insumoId: 'i1',
      concepto: 'Medicación: Ampolla paracetamol',
      cantidad: 2,
      precioUnitario: '120.50',
    });
  });

  it('si no hay stock, la indicación vuelve a pendiente y no se publica nada', async () => {
    const { indicar, cumplir, repo, publicados } = armar({ stockAlcanza: false });
    const ind = await indicar.ejecutar(medicacion);

    await expect(cumplir.ejecutar(ind.id)).rejects.toThrow('Stock insuficiente');

    expect(repo.estadoDe(ind.id)).toBe('pendiente');
    expect(publicados).toEqual([]);
  });

  it('cumplir la misma indicación dos veces da conflicto la segunda (409)', async () => {
    const { indicar, cumplir } = armar();
    const ind = await indicar.ejecutar(medicacion);

    await cumplir.ejecutar(ind.id);

    await expect(cumplir.ejecutar(ind.id)).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });

  it('una indicación que no es medicación se cumple sin tocar el inventario', async () => {
    const { indicar, cumplir, publicados } = armar();
    const ind = await indicar.ejecutar({ ...medicacion, tipo: 'dieta', descripcion: 'Dieta blanda' });

    const r = await cumplir.ejecutar(ind.id);

    expect(r).toEqual({ indicacionId: ind.id, estado: 'cumplida' });
    expect(publicados).toEqual([]);
  });

  it('una indicación inexistente da 404', async () => {
    await expect(armar().cumplir.ejecutar('nada')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });
});

describe('CancelarIndicacionUseCase', () => {
  it('cancela una indicación pendiente', async () => {
    const { indicar, cancelar } = armar();
    const ind = await indicar.ejecutar(medicacion);

    expect((await cancelar.ejecutar(ind.id)).estado).toBe('cancelada');
  });

  it('no se puede cancelar una indicación ya cumplida (422)', async () => {
    const { indicar, cumplir, cancelar } = armar();
    const ind = await indicar.ejecutar(medicacion);
    await cumplir.ejecutar(ind.id);

    await expect(cancelar.ejecutar(ind.id)).rejects.toBeInstanceOf(TransicionInvalidaException);
  });

  it('una indicación cancelada ya no se puede cumplir (409)', async () => {
    const { indicar, cumplir, cancelar } = armar();
    const ind = await indicar.ejecutar(medicacion);
    await cancelar.ejecutar(ind.id);

    await expect(cumplir.ejecutar(ind.id)).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });
});
