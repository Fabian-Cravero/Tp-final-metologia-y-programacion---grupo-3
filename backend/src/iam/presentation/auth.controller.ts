import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UsuarioActual } from '../../shared/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../shared/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { LoginUseCase } from '../application/login.use-case';
import { RegistrarUsuarioUseCase } from '../application/registrar-usuario.use-case';
import { Usuario } from '../domain/entities/usuario.entity';
import { RolUsuario } from '../domain/enums/rol.enum';
import { LoginDto } from './dto/login.dto';
import { CrearUsuarioDto, RegistroDto } from './dto/registro.dto';

/** Nunca se devuelve la entidad completa: el hash no sale del backend. */
export function aRespuesta(u: Usuario) {
  return { id: u.id, email: u.email, nombre: u.nombre, rol: u.rol, activo: u.activo };
}

@ApiTags('iam')
@Controller('iam')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registrarUseCase: RegistrarUsuarioUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.ejecutar(dto);
  }

  /** Autoregistro público: siempre crea un paciente. */
  @Post('registro')
  async registro(@Body() dto: RegistroDto) {
    return aRespuesta(await this.registrarUseCase.ejecutar({ ...dto, rol: RolUsuario.PACIENTE }));
  }

  /** El personal (médicos, enfermeros, recepción) lo da de alta un admin. */
  @Post('usuarios')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  async crearUsuario(@Body() dto: CrearUsuarioDto) {
    return aRespuesta(await this.registrarUseCase.ejecutar(dto));
  }

  @Get('yo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  yo(@UsuarioActual() usuario: UsuarioAutenticado) {
    return usuario;
  }
}
