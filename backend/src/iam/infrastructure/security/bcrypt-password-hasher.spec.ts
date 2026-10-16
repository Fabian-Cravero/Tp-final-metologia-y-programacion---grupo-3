import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('el hash no es la contraseña y la verifica correctamente', async () => {
    const hash = await hasher.hashear('clave-segura');

    expect(hash).not.toBe('clave-segura');
    await expect(hasher.comparar('clave-segura', hash)).resolves.toBe(true);
  });

  it('rechaza una contraseña distinta', async () => {
    const hash = await hasher.hashear('clave-segura');

    await expect(hasher.comparar('otra-clave', hash)).resolves.toBe(false);
  });

  it('dos hashes de la misma contraseña son distintos (sal aleatoria)', async () => {
    const a = await hasher.hashear('clave-segura');
    const b = await hasher.hashear('clave-segura');

    expect(a).not.toBe(b);
  });
});
