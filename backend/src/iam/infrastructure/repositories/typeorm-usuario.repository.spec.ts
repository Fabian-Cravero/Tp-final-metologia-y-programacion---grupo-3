import { Repository } from 'typeorm';
import { Usuario } from '../../domain/entities/usuario.entity';
import { RolUsuario } from '../../domain/enums/rol.enum';
import { TypeOrmUsuarioRepository } from './typeorm-usuario.repository';

function crearUsuario(overrides: Partial<Usuario> = {}): Usuario {
  return Object.assign(new Usuario(), {
    id: 'a1b2c3d4-0000-4000-8000-000000000001',
    email: 'dra.lopez@hospital.test',
    passwordHash: 'hash-de-prueba',
    nombre: 'Dra. López',
    rol: RolUsuario.MEDICO,
    activo: true,
    version: 1,
    ...overrides,
  });
}

describe('TypeOrmUsuarioRepository', () => {
  let typeormRepo: { findOneBy: jest.Mock; save: jest.Mock };
  let repository: TypeOrmUsuarioRepository;

  beforeEach(() => {
    typeormRepo = { findOneBy: jest.fn(), save: jest.fn() };
    repository = new TypeOrmUsuarioRepository(
      typeormRepo as unknown as Repository<Usuario>,
    );
  });

  describe('findByEmail', () => {
    it('busca por email y devuelve el usuario encontrado', async () => {
      const usuario = crearUsuario();
      typeormRepo.findOneBy.mockResolvedValue(usuario);

      const resultado = await repository.findByEmail(usuario.email);

      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({ email: usuario.email });
      expect(resultado).toBe(usuario);
    });

    it('devuelve null si no existe ningún usuario con ese email', async () => {
      typeormRepo.findOneBy.mockResolvedValue(null);

      await expect(repository.findByEmail('nadie@hospital.test')).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('busca por id y devuelve el usuario encontrado', async () => {
      const usuario = crearUsuario();
      typeormRepo.findOneBy.mockResolvedValue(usuario);

      const resultado = await repository.findById(usuario.id);

      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({ id: usuario.id });
      expect(resultado).toBe(usuario);
    });

    it('devuelve null si el id no existe', async () => {
      typeormRepo.findOneBy.mockResolvedValue(null);

      await expect(repository.findById('inexistente')).resolves.toBeNull();
    });
  });

  describe('save', () => {
    it('delega en el repository de TypeORM y devuelve el usuario guardado', async () => {
      const usuario = crearUsuario();
      const guardado = crearUsuario({ version: 2 });
      typeormRepo.save.mockResolvedValue(guardado);

      const resultado = await repository.save(usuario);

      expect(typeormRepo.save).toHaveBeenCalledWith(usuario);
      expect(resultado).toBe(guardado);
    });
  });
});
