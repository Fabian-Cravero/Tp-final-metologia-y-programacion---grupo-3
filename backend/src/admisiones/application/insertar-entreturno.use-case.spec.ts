import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Medico } from '../domain/entities/medico.entity';
import { Paciente } from '../domain/entities/paciente.entity';
import { InsertarEntreturnoUseCase } from './insertar-entreturno.use-case';
import { TurnosEnMemoria } from './turnos-en-memoria';

describe('InsertarEntreturnoUseCase (HU 1.2)', () => {
  // Un día en el futuro, para que la validación de "no en el pasado" no moleste.
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const a = (h: number, m: number) => new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), h, m);

  const medico = Object.assign(new Medico(), { id: 'm1', activo: true });
  const paciente = Object.assign(new Paciente(), { id: 'p-urgencia' });

  let turnos: TurnosEnMemoria;
  let useCase: InsertarEntreturnoUseCase;

  beforeEach(() => {
    turnos = new TurnosEnMemoria();
    turnos.agregar({ fechaHora: a(10, 0), pacienteId: 'carlos' });
    turnos.agregar({ fechaHora: a(10, 30), pacienteId: 'maria' });
    useCase = new InsertarEntreturnoUseCase(
      turnos,
      { findById: async (id: string) => (id === 'p-urgencia' ? paciente : null) } as never,
      { findById: async (id: string) => (id === 'm1' ? medico : null) } as never,
    );
  });

  it('achica el turno de las 10:00 a 15 minutos y crea el entreturno de 10:15 a 10:30', async () => {
    const entreturno = await useCase.ejecutar({ pacienteId: 'p-urgencia', medicoId: 'm1', fechaHora: a(10, 15) });

    expect(entreturno).toMatchObject({ esEntreturno: true, duracionMinutos: 15 });
    expect(turnos.turnos[0]).toMatchObject({ duracionMinutos: 15, duracionReducida: true, version: 2 });
    expect(turnos.turnos[1]).toMatchObject({ duracionMinutos: 30, duracionReducida: false });
  });

  it('dos entreturnos al mismo tiempo: el segundo recibe conflicto (el turno anterior ya cambió)', async () => {
    // Simulamos que las dos peticiones leyeron la agenda antes de que la otra guardara:
    // las dos ven el turno de las 10:00 con 30 minutos y versión 1.
    const fotoDeAntes = (await turnos.listarPorMedicoYDia('m1', a(10, 0))).map((t) => ({ ...t }));
    turnos.listarPorMedicoYDia = async () => fotoDeAntes as never;

    await useCase.ejecutar({ pacienteId: 'p-urgencia', medicoId: 'm1', fechaHora: a(10, 15) });
    await expect(
      useCase.ejecutar({ pacienteId: 'p-urgencia', medicoId: 'm1', fechaHora: a(10, 20) }),
    ).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });

  it('no permite insertar en el pasado', async () => {
    await expect(
      useCase.ejecutar({ pacienteId: 'p-urgencia', medicoId: 'm1', fechaHora: new Date(Date.now() - 60_000) }),
    ).rejects.toThrow('pasado');
  });

  it('el paciente tiene que existir', async () => {
    await expect(
      useCase.ejecutar({ pacienteId: 'nadie', medicoId: 'm1', fechaHora: a(10, 15) }),
    ).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });

  it('en un horario libre pide reservar un turno común', async () => {
    await expect(
      useCase.ejecutar({ pacienteId: 'p-urgencia', medicoId: 'm1', fechaHora: a(15, 0) }),
    ).rejects.toBeInstanceOf(DomainException);
    expect(turnos.turnos).toHaveLength(2); // no se tocó nada
  });
});
