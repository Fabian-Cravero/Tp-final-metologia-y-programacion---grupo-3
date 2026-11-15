import { DomainException } from '../../shared/exceptions/domain.exception';
import { planificarEntreturno, type TurnoDeAgenda } from './entreturno';

const a = (horaMinutos: string) => new Date(`2030-03-15T${horaMinutos}:00`);

function turno(id: string, hora: string, extra: Partial<TurnoDeAgenda> = {}): TurnoDeAgenda {
  return { id, fechaHora: a(hora), duracionMinutos: 30, estado: 'programado', version: 1, ...extra };
}

describe('planificarEntreturno (HU 1.2)', () => {
  it('escenario de la HU: turnos 10:00 y 10:30, entreturno a las 10:15', () => {
    const agenda = [turno('t10', '10:00', { version: 3 }), turno('t1030', '10:30')];

    expect(planificarEntreturno(agenda, a('10:15'))).toEqual({
      turnoAnteriorId: 't10',
      versionAnterior: 3,
      nuevaDuracionAnterior: 15, // el turno de las 10:00 queda de 15 minutos
      duracionEntreturno: 15, // el entreturno va de 10:15 a 10:30
    });
  });

  it('si no hay turno siguiente, el entreturno dura hasta donde terminaba el anterior', () => {
    expect(planificarEntreturno([turno('t10', '10:00')], a('10:20'))).toMatchObject({
      nuevaDuracionAnterior: 20,
      duracionEntreturno: 10,
    });
  });

  it('no deja que el entreturno pise un turno que empieza antes de que termine el anterior', () => {
    // Un turno de 60 minutos a las 10:00 y otro a las 10:30 (superpuestos): el entreturno de 10:15 corta a las 10:30.
    const agenda = [turno('largo', '10:00', { duracionMinutos: 60 }), turno('t1030', '10:30')];
    expect(planificarEntreturno(agenda, a('10:15')).duracionEntreturno).toBe(15);
  });

  it('rechaza un horario donde ya empieza un turno', () => {
    expect(() => planificarEntreturno([turno('t10', '10:00')], a('10:00'))).toThrow('Ya hay un turno');
  });

  it('rechaza un horario libre: ahí corresponde un turno común', () => {
    expect(() => planificarEntreturno([turno('t10', '10:00')], a('11:00'))).toThrow(DomainException);
  });

  it('ignora los turnos cancelados', () => {
    const agenda = [turno('t10', '10:00', { estado: 'cancelado' })];
    expect(() => planificarEntreturno(agenda, a('10:15'))).toThrow('turno existente');
  });

  it('no le quita tiempo a un turno ya atendido', () => {
    const agenda = [turno('t10', '10:00', { estado: 'atendido' })];
    expect(() => planificarEntreturno(agenda, a('10:15'))).toThrow('ya fue atendido');
  });

  it('rechaza si el turno anterior quedaría demasiado corto', () => {
    expect(() => planificarEntreturno([turno('t10', '10:00')], a('10:03'))).toThrow('turno anterior quedaría');
  });

  it('rechaza si el entreturno quedaría demasiado corto', () => {
    expect(() => planificarEntreturno([turno('t10', '10:00')], a('10:28'))).toThrow('entreturno duraría');
  });
});
