import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../../domain/enums/rol.enum';

export class RegistroDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
}

/** Solo lo usa el admin: puede elegir cualquier rol. */
export class CrearUsuarioDto extends RegistroDto {
  @ApiProperty({ enum: RolUsuario })
  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
