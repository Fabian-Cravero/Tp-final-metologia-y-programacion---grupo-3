import { Inject, Injectable } from '@nestjs/common';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { aCentavos, deCentavos } from '../domain/dinero';
import { Cobertura } from '../domain/entities/cobertura.entity';
import { Factura } from '../domain/entities/factura.entity';
import { ResolverEstrategiaCobertura } from '../domain/estrategias/resolver-estrategia';
import {
  FACTURA_REPOSITORY,
  type IFacturaRepository,
} from '../domain/repositories/factura-repository.interface';

export interface RegistrarCargoCommand {
  pacienteId: string;
  concepto: string;
  cantidad: number;
  /** Como lo guarda Postgres: "1250.50". */
  precioUnitario: string;
}

/** Agrega una línea a la factura abierta del paciente (o abre una) y recalcula los montos. */
@Injectable()
export class RegistrarCargoUseCase {
  constructor(
    @Inject(FACTURA_REPOSITORY) private readonly facturas: IFacturaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    private readonly estrategias: ResolverEstrategiaCobertura,
  ) {}

  async ejecutar(cmd: RegistrarCargoCommand): Promise<Factura> {
    const concepto = (cmd.concepto ?? '').trim();
    if (!concepto) throw new DomainException('El cargo necesita un concepto');
    if (!Number.isInteger(cmd.cantidad) || cmd.cantidad <= 0) {
      throw new DomainException('La cantidad debe ser un entero positivo');
    }
    const precio = Number(cmd.precioUnitario);
    if (!Number.isFinite(precio) || precio < 0) {
      throw new DomainException('El precio unitario debe ser un número mayor o igual a 0');
    }

    const paciente = await this.pacientes.findById(cmd.pacienteId);
    if (!paciente) throw new RecursoNoEncontradoException('Paciente');

    // Factura abierta del paciente, o una nueva con su cobertura (sin cobertura => particular).
    let factura = await this.facturas.findAbiertaDePaciente(paciente.id);
    if (!factura) {
      const cobertura = await this.coberturaDe(paciente.coberturaId);
      const creada = await this.facturas.crear(paciente.id, cobertura.id);
      factura = (await this.facturas.findById(creada.id)) ?? Object.assign(creada, { cobertura });
    }

    // Se elige la estrategia antes de tocar nada: si la cobertura no tiene cálculo, no queda una línea suelta.
    const estrategia = this.estrategias.para(factura.cobertura.tipo);

    await this.facturas.agregarLinea(factura.id, concepto, cmd.cantidad, deCentavos(aCentavos(precio)));

    // Recalcula siempre desde las líneas guardadas: el total nunca se arrastra de un valor viejo.
    const lineas = await this.facturas.lineasDe(factura.id);
    const baseCentavos = lineas.reduce((acc, l) => acc + l.cantidad * aCentavos(l.precioUnitario), 0);
    const calculo = estrategia.calcular(baseCentavos, Number(factura.cobertura.porcentajeCobertura));

    await this.facturas.actualizarTotales(
      factura.id,
      deCentavos(calculo.montoPacienteCentavos),
      deCentavos(calculo.montoCubiertoCentavos),
    );

    return (await this.facturas.findById(factura.id)) ?? factura;
  }

  private async coberturaDe(coberturaId: string | null): Promise<Cobertura> {
    const cobertura = coberturaId
      ? await this.facturas.findCobertura(coberturaId)
      : await this.facturas.findCoberturaPorTipo('particular');
    if (!cobertura) throw new DomainException('No hay una cobertura configurada para el paciente');
    return cobertura;
  }
}
