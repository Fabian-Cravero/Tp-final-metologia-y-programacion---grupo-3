import { type IPacienteRepository } from '../../admisiones/domain/repositories/paciente-repository.interface';
import { type IEventPublisher } from '../../shared/events/event-publisher.interface';
import { EVENTOS } from '../../shared/events/eventos';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { SignoVital } from '../domain/entities/signo-vital.entity';
import {
  type ISignoVitalRepository,
  type NuevoSignoVital,
} from '../domain/repositories/signo-vital-repository.interface';
import { RegistrarSignoVitalUseCase } from './registrar-signo-vital.use-case';

class SignosEnMemoria implements ISignoVitalRepository {
  readonly guardados: NuevoSignoVital[] = [];
  async registrar(d: NuevoSignoVital) {
    this.guardados.push(d);
    return Object.assign(new SignoVital(), { id: `s${this.guardados.length}`, ...d, valor: String(d.valor) });
  }
  async historialDePaciente() { return []; }
}

const pacientes = {
  findById: async (id: string) => (id === 'p1' ? { id } : null),
} as unknown as IPacienteRepository;

function armar() {
  const signos = new SignosEnMemoria();
  const publicados: { evento: string; payload: object }[] = [];
  const eventos: IEventPublisher = { publicar: (evento, payload) => { publicados.push({ evento, payload }); } };
  return { useCase: new RegistrarSignoVitalUseCase(signos, pacientes, eventos), signos, publicados };
}

describe('RegistrarSignoVitalUseCase', () => {
  it('un valor normal se guarda con su unidad y no publica nada', async () => {
    const { useCase, signos, publicados } = armar();

    const r = await useCase.ejecutar({ pacienteId: 'p1', registradoPorId: 'u1', tipo: 'frecuencia_cardiaca', valor: 75 });

    expect(r.severidad).toBe('normal');
    expect(signos.guardados[0]).toMatchObject({ unidad: 'lpm', registradoPorId: 'u1' });
    expect(publicados).toEqual([]);
  });

  it('un valor crítico publica el evento de signo vital fuera de rango', async () => {
    const { useCase, publicados } = armar();

    const r = await useCase.ejecutar({ pacienteId: 'p1', registradoPorId: 'u1', tipo: 'frecuencia_cardiaca', valor: 35 });

    expect(r.severidad).toBe('critico');
    expect(publicados).toEqual([
      {
        evento: EVENTOS.SIGNO_VITAL_FUERA_DE_RANGO,
        payload: { pacienteId: 'p1', tipo: 'frecuencia_cardiaca', valor: 35, severidad: 'critico' },
      },
    ]);
  });

  it('una alerta también se publica', async () => {
    const { useCase, publicados } = armar();

    await useCase.ejecutar({ pacienteId: 'p1', registradoPorId: 'u1', tipo: 'temperatura', valor: 38.2 });

    expect(publicados).toHaveLength(1);
  });

  it('rechaza un paciente inexistente o un tipo desconocido', async () => {
    const { useCase } = armar();

    await expect(
      useCase.ejecutar({ pacienteId: 'p9', registradoPorId: 'u1', tipo: 'temperatura', valor: 37 }),
    ).rejects.toBeInstanceOf(RecursoNoEncontradoException);
    await expect(
      useCase.ejecutar({ pacienteId: 'p1', registradoPorId: 'u1', tipo: 'azucar', valor: 90 }),
    ).rejects.toBeInstanceOf(DomainException);
  });
});
