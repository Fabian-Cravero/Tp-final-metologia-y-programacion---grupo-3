import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RegistrarMedicoDto {
  @ApiProperty({ example: 'MP-12345' }) @IsString() @IsNotEmpty() matricula: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() apellido: string;
  @ApiProperty({ example: 'Clínica médica' }) @IsString() @IsNotEmpty() especialidad: string;

  @ApiPropertyOptional({ description: 'Id del usuario (IAM) con el que el médico inicia sesión' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}
