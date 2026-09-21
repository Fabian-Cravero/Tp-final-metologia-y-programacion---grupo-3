import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../domain/repositories/usuario-repository.interface';

@Injectable()
export class TypeOrmUsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOneBy({ email });
  }

  findById(id: string): Promise<Usuario | null> {
    return this.repo.findOneBy({ id });
  }

  save(usuario: Usuario): Promise<Usuario> {
    return this.repo.save(usuario);
  }
}
