export interface IPasswordHasher {
  hashear(plano: string): Promise<string>;
  comparar(plano: string, hashGuardado: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
