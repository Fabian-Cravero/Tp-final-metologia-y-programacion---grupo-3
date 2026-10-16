import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('Nest lo puede instanciar en cualquier módulo, sin importar PassportModule', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    expect(moduleRef.get(JwtAuthGuard)).toBeInstanceOf(JwtAuthGuard);
  });
});
