import { DomainException } from '../../shared/exceptions/domain.exception';
import { Paciente } from '../domain/entities/paciente.entity';
import { type IPacienteRepository } from '../domain/repositories/paciente-repository.interface';
import { RegistrarPacienteUseCase } from './registrar-paciente.use-case';

class PacientesEnMemoria implements IPacienteRepository {
  readonly guardados: Paciente[] = [];

  async findById(id: string) { return this.guardados.find((p) => p.id === id) ?? null; }
  async findByDni(dni: string) { return this.guardados.find((p) => p.dni === dni) ?? null; }
  async buscar() { return this.guardados; }
  async save(p: Paciente) { this.guardados.push(p); return p; }
}

const comando = {
  dni: '30123456',
  nombre: '  Ana ',
  apellido: ' Pérez ',
  fechaNacimiento: '1990-05-21',
};

describe('RegistrarPacienteUseCase', () => {
  it('registra el paciente limpiando espacios', async () => {
    const repo = new PacientesEnMemoria();
    const paciente = await new RegistrarPacienteUseCase(repo).ejecutar(comando);

    expect(paciente.nombre).toBe('Ana');
    expect(paciente.apellido).toBe('Pérez');
    expect(paciente.usuarioId).toBeNull();
  });

  it('rechaza un DNI repetido', async () => {
    const uc = new RegistrarPacienteUseCase(new PacientesEnMemoria());
    await uc.ejecutar(comando);

    await expect(uc.ejecutar(comando)).rejects.toBeInstanceOf(DomainException);
  });
});
