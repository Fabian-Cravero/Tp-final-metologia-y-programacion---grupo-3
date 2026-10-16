import { ConfigService } from '@nestjs/config';
import { RegistrarUsuarioUseCase } from '../../application/registrar-usuario.use-case';
import {
  crearUsuario,
  hasherFalso,
  UsuariosEnMemoria,
} from '../../application/usuarios-en-memoria';
import { RolUsuario } from '../../domain/enums/rol.enum';
import { SembrarAdminService } from './sembrar-admin.service';

function crear(env: Record<string, string>, repo = new UsuariosEnMemoria()) {
  const config = { get: (k: string) => env[k] } as unknown as ConfigService;
  const registrar = new RegistrarUsuarioUseCase(repo, hasherFalso);
  return { servicio: new SembrarAdminService(config, registrar, repo), repo };
}

describe('SembrarAdminService', () => {
  it('crea el administrador si hay variables y el usuario no existe', async () => {
    const { servicio, repo } = crear({
      ADMIN_EMAIL: 'admin@hospital.test',
      ADMIN_PASSWORD: 'clave-segura-1',
    });

    await servicio.onApplicationBootstrap();

    expect(repo.guardados).toHaveLength(1);
    expect(repo.guardados[0].email).toBe('admin@hospital.test');
    expect(repo.guardados[0].rol).toBe(RolUsuario.ADMIN);
  });

  it('no hace nada si faltan las variables de entorno', async () => {
    const { servicio, repo } = crear({});

    await servicio.onApplicationBootstrap();

    expect(repo.guardados).toHaveLength(0);
  });

  it('no duplica al administrador si ya existe', async () => {
    const repo = new UsuariosEnMemoria([crearUsuario({ email: 'admin@hospital.test' })]);
    const { servicio } = crear(
      { ADMIN_EMAIL: 'admin@hospital.test', ADMIN_PASSWORD: 'clave-segura-1' },
      repo,
    );

    await servicio.onApplicationBootstrap();

    expect(repo.guardados).toHaveLength(0);
  });
});
