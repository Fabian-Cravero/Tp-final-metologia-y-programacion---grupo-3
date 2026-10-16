import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private static readonly RONDAS = 10;

  hashear(plano: string): Promise<string> {
    return hash(plano, BcryptPasswordHasher.RONDAS);
  }

  comparar(plano: string, hashGuardado: string): Promise<boolean> {
    return compare(plano, hashGuardado);
  }
}
