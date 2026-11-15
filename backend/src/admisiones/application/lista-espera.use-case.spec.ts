import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { EVENTOS } from '../../shared/events/eventos';
import { diaLocal } from '../domain/dia-local';
import { Medico } from '../domain/entities/medico.entity';
import { Paciente } from '../domain/entities/paciente.entity';
import { AgregarAListaEsperaUseCase } from './agregar-a-lista-espera.use-case';
import { CancelarTurnoUseCase } from './cancelar-turno.use-case';
import { ListaEsperaEnMemoria } from './lista-espera-en-memoria';
import { MarcarAvisadoUseCase } from './marcar-avisado.use-case';
import { PromoverDesdeListaEsperaUseCase } from './promover-desde-lista-espera.use-case';
import { TurnosEnMemoria } from './turnos-en-memoria';

// Todo pasa mañana a las 11:00, para que ningún horario quede en el pasado.
const manana = new Date();
manana.setDate(manana.getDate() + 1);
const alas = (h: number, m = 0) => new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), h, m);
const DIA = diaLocal(manana);

const medicoActivo = Object.assign(new Medico(), { id: 'silva', activo: true });
const pacientes = { findById: async (id: string) => (id === 'nadie' ? null : Object.assign(new Paciente(), { id })) } as never;
const medicos = { findById: async (id: string) => (id === 'silva' ? medicoActivo : null) } as never;

describe('HU 1.3 - Lista de espera', () => {
  let lista: ListaEsperaEnMemoria;
  let turnos: TurnosEnMemoria;
  let promover: PromoverDesdeListaEsperaUseCase;

  beforeEach(() => {
    lista = new ListaEsperaEnMemoria();
    turnos = new TurnosEnMemoria();
    promover = new PromoverDesdeListaEsperaUseCase(lista, turnos);
  });

  describe('AgregarAListaEsperaUseCase', () => {
    const agregar = () => new AgregarAListaEsperaUseCase(lista, pacientes, medicos);

    it('anota al paciente en la lista del médico para ese día', async () => {
      const registro = await agregar().ejecutar({ pacienteId: 'luis', medicoId: 'silva', dia: DIA });
      expect(registro).toMatchObject({ estado: 'esperando', dia: DIA, avisado: false });
    });

    it('no deja anotar dos veces al mismo paciente', async () => {
      await agregar().ejecutar({ pacienteId: 'luis', medicoId: 'silva', dia: DIA });
      await expect(agregar().ejecutar({ pacienteId: 'luis', medicoId: 'silva', dia: DIA })).rejects.toThrow('ya está');
    });

    it('no acepta un día que ya pasó', async () => {
      await expect(agregar().ejecutar({ pacienteId: 'luis', medicoId: 'silva', dia: '2020-01-01' })).rejects.toThrow('ya pasó');
    });

    it('el paciente y el médico tienen que existir', async () => {
      await expect(agregar().ejecutar({ pacienteId: 'nadie', medicoId: 'silva', dia: DIA })).rejects.toBeInstanceOf(
        RecursoNoEncontradoException,
      );
      await expect(agregar().ejecutar({ pacienteId: 'luis', medicoId: 'otro', dia: DIA })).rejects.toBeInstanceOf(
        RecursoNoEncontradoException,
      );
    });
  });

  describe('PromoverDesdeListaEsperaUseCase', () => {
    it('escenario de la HU: se cancela el turno de las 11:00 y Luis Medina, primero en la lista, lo recibe', async () => {
      await lista.agregar('luis-medina', 'silva', DIA);
      await lista.agregar('ana', 'silva', DIA);

      const promovido = await promover.ejecutar({ medicoId: 'silva', fechaHora: alas(11), duracionMinutos: 30 });

      expect(promovido?.paciente.id).toBe('luis-medina');
      expect(lista.registros[0]).toMatchObject({ estado: 'asignado', avisado: false });
      expect(lista.registros[0].turnoAsignadoId).toBe(turnos.turnos[0].id);
      expect(turnos.turnos[0]).toMatchObject({ fechaHora: alas(11), paciente: { id: 'luis-medina' } });
      expect(lista.registros[1].estado).toBe('esperando'); // Ana sigue esperando
    });

    it('sin nadie en la lista no hace nada', async () => {
      await expect(promover.ejecutar({ medicoId: 'silva', fechaHora: alas(11), duracionMinutos: 30 })).resolves.toBeNull();
      expect(turnos.turnos).toHaveLength(0);
    });

    it('solo promueve pacientes que esperan a ese médico ese mismo día', async () => {
      await lista.agregar('luis', 'otro-medico', DIA);
      await lista.agregar('ana', 'silva', '2099-01-01');
      await expect(promover.ejecutar({ medicoId: 'silva', fechaHora: alas(11), duracionMinutos: 30 })).resolves.toBeNull();
    });

    it('si alguien reservó el horario liberado un instante antes, el paciente vuelve a la lista', async () => {
      await lista.agregar('luis', 'silva', DIA);
      await turnos.crear({ pacienteId: 'otro', medicoId: 'silva', fechaHora: alas(11) }); // le ganaron de mano

      await expect(promover.ejecutar({ medicoId: 'silva', fechaHora: alas(11), duracionMinutos: 30 })).resolves.toBeNull();
      expect(lista.registros[0]).toMatchObject({ estado: 'esperando', turnoAsignadoId: null });
    });

    it('dos cancelaciones al mismo tiempo no le dan dos turnos al mismo paciente', async () => {
      await lista.agregar('luis', 'silva', DIA);
      await lista.agregar('ana', 'silva', DIA);

      // Las dos promociones leyeron la lista antes de que la otra tomara a Luis.
      const fotoDeAntes = await lista.esperandoPorMedicoYDia('silva', DIA);
      lista.esperandoPorMedicoYDia = async () => [...fotoDeAntes];

      const primera = await promover.ejecutar({ medicoId: 'silva', fechaHora: alas(11), duracionMinutos: 30 });
      const segunda = await promover.ejecutar({ medicoId: 'silva', fechaHora: alas(12), duracionMinutos: 30 });

      expect(primera?.paciente.id).toBe('luis');
      expect(segunda?.paciente.id).toBe('ana'); // Luis ya estaba tomado: pasó al siguiente
    });

    it('un horario que ya pasó no se ofrece', async () => {
      await lista.agregar('luis', 'silva', diaLocal(new Date()));
      await expect(
        promover.ejecutar({ medicoId: 'silva', fechaHora: new Date(Date.now() - 60_000), duracionMinutos: 30 }),
      ).resolves.toBeNull();
    });
  });

  describe('Cancelar un turno publica el evento que dispara la promoción', () => {
    it('publica TurnoCancelado con el médico, el horario y la duración', async () => {
      const turno = turnos.agregar({ medicoId: 'silva', fechaHora: alas(11), duracionMinutos: 15 });
      const publicados: [string, object][] = [];
      const cancelar = new CancelarTurnoUseCase(turnos, { publicar: (e, p) => publicados.push([e, p]) });

      await cancelar.ejecutar(turno.id);

      expect(publicados).toEqual([
        [EVENTOS.TURNO_CANCELADO, { turnoId: turno.id, medicoId: 'silva', fechaHora: alas(11).toISOString(), duracionMinutos: 15 }],
      ]);
    });
  });

  describe('MarcarAvisadoUseCase', () => {
    it('la recepcionista marca que ya le avisó al paciente', async () => {
      const r = await lista.agregar('luis', 'silva', DIA);
      await lista.tomar(r.id);

      await expect(new MarcarAvisadoUseCase(lista).ejecutar(r.id)).resolves.toMatchObject({ avisado: true });
      expect(lista.registros[0].avisado).toBe(true);
    });

    it('no se puede marcar a alguien que todavía no tiene turno', async () => {
      const r = await lista.agregar('luis', 'silva', DIA);
      await expect(new MarcarAvisadoUseCase(lista).ejecutar(r.id)).rejects.toBeInstanceOf(DomainException);
    });
  });
});
