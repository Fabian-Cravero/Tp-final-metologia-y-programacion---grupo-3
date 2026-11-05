import { DomainException } from '../../../shared/exceptions/domain.exception';
import { ProtocoloBuilder } from './protocolo.builder';
import { MotivoIngreso, ProtocoloDirector } from './protocolo.director';

describe('ProtocoloBuilder', () => {
  it('numera las tareas en el orden en que se agregan', () => {
    const plan = new ProtocoloBuilder().conMotivo('x').agregarTarea('A').agregarTarea('B').build();
    expect(plan.tareas).toEqual([
      { descripcion: 'A', orden: 1 },
      { descripcion: 'B', orden: 2 },
    ]);
  });

  it('no arma un protocolo sin motivo o sin tareas', () => {
    expect(() => new ProtocoloBuilder().agregarTarea('A').build()).toThrow(DomainException);
    expect(() => new ProtocoloBuilder().conMotivo('x').build()).toThrow(DomainException);
  });
});

describe('ProtocoloDirector', () => {
  const director = new ProtocoloDirector();

  it('el pre-operatorio tiene siete tareas y el respiratorio seis', () => {
    expect(director.construir(MotivoIngreso.PRE_OPERATORIO).tareas).toHaveLength(7);
    expect(director.construir(MotivoIngreso.RESPIRATORIO).tareas).toHaveLength(6);
  });

  it('cada motivo arma tareas distintas', () => {
    const pre = director.construir(MotivoIngreso.PRE_OPERATORIO);
    const resp = director.construir(MotivoIngreso.RESPIRATORIO);

    expect(pre.motivoIngreso).toBe('pre_operatorio');
    expect(resp.motivoIngreso).toBe('respiratorio');
    expect(pre.tareas.map((t) => t.descripcion)).not.toEqual(resp.tareas.map((t) => t.descripcion));
  });

  it('rechaza un motivo sin receta', () => {
    expect(() => director.construir('desconocido')).toThrow(DomainException);
  });
});
