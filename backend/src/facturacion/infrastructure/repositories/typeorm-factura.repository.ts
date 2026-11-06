import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { esViolacionDeUnicidad } from '../../../shared/database/errores-pg';
import { DomainException } from '../../../shared/exceptions/domain.exception';
import { Cobertura } from '../../domain/entities/cobertura.entity';
import { Factura } from '../../domain/entities/factura.entity';
import { LineaFactura } from '../../domain/entities/linea-factura.entity';
import { type IFacturaRepository } from '../../domain/repositories/factura-repository.interface';

@Injectable()
export class TypeOrmFacturaRepository implements IFacturaRepository {
  constructor(
    @InjectRepository(Factura) private readonly facturas: Repository<Factura>,
    @InjectRepository(LineaFactura) private readonly lineas: Repository<LineaFactura>,
    @InjectRepository(Cobertura) private readonly coberturas: Repository<Cobertura>,
  ) {}

  findById(id: string) {
    return this.facturas.findOne({ where: { id }, relations: { cobertura: true } });
  }

  findAbiertaDePaciente(pacienteId: string) {
    return this.facturas.findOne({ where: { pacienteId, estado: 'pendiente' }, relations: { cobertura: true } });
  }

  listarDePaciente(pacienteId: string) {
    return this.facturas.find({ where: { pacienteId }, relations: { cobertura: true }, order: { emitidaEn: 'DESC' } });
  }

  async crear(pacienteId: string, coberturaId: string) {
    try {
      return await this.facturas.save(this.facturas.create({ pacienteId, cobertura: { id: coberturaId } }));
    } catch (error) {
      // Dos cargos simultáneos: el índice único parcial deja abrir una sola; el otro usa esa.
      if (esViolacionDeUnicidad(error)) {
        const abierta = await this.findAbiertaDePaciente(pacienteId);
        if (abierta) return abierta;
      }
      throw error;
    }
  }

  agregarLinea(facturaId: string, concepto: string, cantidad: number, precioUnitario: string) {
    return this.lineas.save(this.lineas.create({ factura: { id: facturaId }, concepto, cantidad, precioUnitario }));
  }

  lineasDe(facturaId: string) {
    return this.lineas.find({ where: { factura: { id: facturaId } } });
  }

  async actualizarTotales(facturaId: string, total: string, montoCubierto: string) {
    await this.facturas.update({ id: facturaId }, { total, montoCubierto });
  }

  async cambiarEstado(id: string, desde: string, hasta: string) {
    const r = await this.facturas.update({ id, estado: desde }, { estado: hasta });
    return r.affected === 1;
  }

  findCobertura(id: string) {
    return this.coberturas.findOneBy({ id });
  }

  findCoberturaPorTipo(tipo: string) {
    return this.coberturas.findOneBy({ tipo });
  }

  listarCoberturas() {
    return this.coberturas.find({ order: { nombre: 'ASC' } });
  }

  async crearCobertura(nombre: string, tipo: string, porcentaje: string) {
    try {
      return await this.coberturas.save(this.coberturas.create({ nombre, tipo, porcentajeCobertura: porcentaje }));
    } catch (error) {
      if (esViolacionDeUnicidad(error)) throw new DomainException(`Ya existe la cobertura "${nombre}"`);
      throw error;
    }
  }
}
