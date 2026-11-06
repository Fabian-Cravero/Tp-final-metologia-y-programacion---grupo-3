import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
  TransicionInvalidaException,
} from '../../shared/exceptions/domain.exception';
import { AnularFacturaUseCase } from './anular-factura.use-case';
import { EmitirFacturaUseCase } from './emitir-factura.use-case';
import { FacturasEnMemoria } from './facturas-en-memoria';
import { PagarFacturaUseCase } from './pagar-factura.use-case';

async function conFactura(lineas: number) {
  const repo = new FacturasEnMemoria();
  repo.agregarCobertura('c1', 'particular', '0.00');
  const factura = await repo.crear('p1', 'c1');
  for (let i = 0; i < lineas; i++) await repo.agregarLinea(factura.id, `Cargo ${i}`, 1, '100.00');
  return { repo, id: factura.id };
}

describe('Ciclo de la factura (casos de uso)', () => {
  it('emitir y pagar', async () => {
    const { repo, id } = await conFactura(1);

    expect((await new EmitirFacturaUseCase(repo).ejecutar(id)).estado).toBe('emitida');
    expect((await new PagarFacturaUseCase(repo).ejecutar(id)).estado).toBe('pagada');
  });

  it('pagar una factura pendiente da 422', async () => {
    const { repo, id } = await conFactura(1);

    await expect(new PagarFacturaUseCase(repo).ejecutar(id)).rejects.toBeInstanceOf(TransicionInvalidaException);
  });

  it('no se emite una factura sin líneas', async () => {
    const { repo, id } = await conFactura(0);

    await expect(new EmitirFacturaUseCase(repo).ejecutar(id)).rejects.toBeInstanceOf(DomainException);
  });

  it('anular una emitida; una pagada ya no se anula', async () => {
    const a = await conFactura(1);
    await new EmitirFacturaUseCase(a.repo).ejecutar(a.id);
    expect((await new AnularFacturaUseCase(a.repo).ejecutar(a.id)).estado).toBe('anulada');

    const b = await conFactura(1);
    await new EmitirFacturaUseCase(b.repo).ejecutar(b.id);
    await new PagarFacturaUseCase(b.repo).ejecutar(b.id);
    await expect(new AnularFacturaUseCase(b.repo).ejecutar(b.id)).rejects.toBeInstanceOf(TransicionInvalidaException);
  });

  it('si otra petición cambió el estado entre la lectura y el UPDATE, da 409', async () => {
    const { repo, id } = await conFactura(1);
    repo.cambiarEstado = async () => false; // simula que otro ganó la carrera

    await expect(new EmitirFacturaUseCase(repo).ejecutar(id)).rejects.toBeInstanceOf(ConflictoDeConcurrenciaException);
  });

  it('una factura inexistente da 404', async () => {
    const { repo } = await conFactura(0);

    await expect(new EmitirFacturaUseCase(repo).ejecutar('nada')).rejects.toBeInstanceOf(RecursoNoEncontradoException);
  });
});
