import { CamasEnMemoria } from './camas-en-memoria';
import { ObtenerMapaCamasUseCase } from './obtener-mapa-camas.use-case';

describe('ObtenerMapaCamasUseCase', () => {
  it('agrupa las camas por sector y cuenta las libres', async () => {
    const camas = new CamasEnMemoria();
    camas.agregar({ codigo: 'A-1', sector: 'Clínica', estado: 'libre' });
    camas.agregar({ codigo: 'A-2', sector: 'Clínica', estado: 'ocupada' });
    camas.agregar({ codigo: 'U-1', sector: 'Terapia', estado: 'libre' });

    const mapa = await new ObtenerMapaCamasUseCase(camas).ejecutar();

    expect(mapa).toHaveLength(2);
    const clinica = mapa.find((s) => s.sector === 'Clínica');
    expect(clinica?.libres).toBe(1);
    expect(clinica?.camas.map((c) => c.codigo)).toEqual(['A-1', 'A-2']);
    expect(mapa.find((s) => s.sector === 'Terapia')?.libres).toBe(1);
  });

  it('con el hospital sin camas devuelve una lista vacía', async () => {
    expect(await new ObtenerMapaCamasUseCase(new CamasEnMemoria()).ejecutar()).toEqual([]);
  });
});
