import { Inject, Injectable } from '@nestjs/common';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import { Paciente } from '../../admisiones/domain/entities/paciente.entity';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Cobertura } from '../domain/entities/cobertura.entity';
import {
  FACTURA_REPOSITORY,
  type IFacturaRepository,
} from '../domain/repositories/factura-repository.interface';

export interface CrearCoberturaCommand {
  nombre: string;
  tipo: string;
  porcentajeCobertura: number;
}

/** Alta y consulta de coberturas, y asignación de la cobertura de un paciente. */
@Injectable()
export class CoberturasUseCase {
  constructor(
    @Inject(FACTURA_REPOSITORY) private readonly facturas: IFacturaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
  ) {}

  listar(): Promise<Cobertura[]> {
    return this.facturas.listarCoberturas();
  }

  async crear(cmd: CrearCoberturaCommand): Promise<Cobertura> {
    const nombre = (cmd.nombre ?? '').trim();
    const tipo = (cmd.tipo ?? '').trim().toLowerCase();
    if (!nombre || !tipo) throw new DomainException('El nombre y el tipo de la cobertura son obligatorios');
    if (!Number.isFinite(cmd.porcentajeCobertura) || cmd.porcentajeCobertura < 0 || cmd.porcentajeCobertura > 100) {
      throw new DomainException('El porcentaje de cobertura va de 0 a 100');
    }
    return this.facturas.crearCobertura(nombre, tipo, cmd.porcentajeCobertura.toFixed(2));
  }

  /** Vale para las facturas que se abran desde ahora; una factura ya abierta conserva su cobertura. */
  async asignarAPaciente(pacienteId: string, coberturaId: string): Promise<Paciente> {
    const paciente = await this.pacientes.findById(pacienteId);
    if (!paciente) throw new RecursoNoEncontradoException('Paciente');
    if (!(await this.facturas.findCobertura(coberturaId))) throw new RecursoNoEncontradoException('Cobertura');

    paciente.coberturaId = coberturaId;
    return this.pacientes.save(paciente);
  }
}
