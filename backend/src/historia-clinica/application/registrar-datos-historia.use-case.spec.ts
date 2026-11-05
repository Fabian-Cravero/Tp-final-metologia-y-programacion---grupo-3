import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { SeveridadAlergia } from '../domain/enums/severidad-alergia.enum';
import { HistoriasEnMemoria } from './historias-en-memoria';
import { RegistrarAlergiaUseCase } from './registrar-alergia.use-case';
import { RegistrarAntecedenteUseCase } from './registrar-antecedente.use-case';

describe('Alergias y antecedentes', () => {
  let repo: HistoriasEnMemoria;

  beforeEach(async () => {
    repo = new HistoriasEnMemoria();
    await repo.crear('p1', null);
  });

  it('registra una alergia limpiando espacios', async () => {
    const alergia = await new RegistrarAlergiaUseCase(repo).ejecutar('p1', ' Penicilina ', SeveridadAlergia.GRAVE);

    expect(alergia).toMatchObject({ sustancia: 'Penicilina', severidad: 'grave' });
    expect(await repo.listarAlergias('h1')).toHaveLength(1);
  });

  it('rechaza una alergia sin sustancia', async () => {
    await expect(
      new RegistrarAlergiaUseCase(repo).ejecutar('p1', '   ', SeveridadAlergia.LEVE),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('registra un antecedente familiar', async () => {
    const antecedente = await new RegistrarAntecedenteUseCase(repo).ejecutar('p1', ' madre ', ' Diabetes tipo 2 ');

    expect(antecedente).toMatchObject({ parentesco: 'madre', descripcion: 'Diabetes tipo 2' });
  });

  it('rechaza un antecedente sin descripción', async () => {
    await expect(new RegistrarAntecedenteUseCase(repo).ejecutar('p1', 'padre', ' ')).rejects.toBeInstanceOf(
      DomainException,
    );
  });

  it('sin historia abierta responde 404', async () => {
    await expect(
      new RegistrarAlergiaUseCase(repo).ejecutar('p9', 'Látex', SeveridadAlergia.MODERADA),
    ).rejects.toBeInstanceOf(RecursoNoEncontradoException);
    await expect(new RegistrarAntecedenteUseCase(repo).ejecutar('p9', 'madre', 'Asma')).rejects.toBeInstanceOf(
      RecursoNoEncontradoException,
    );
  });
});
