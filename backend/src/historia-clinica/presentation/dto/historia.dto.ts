import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeveridadAlergia } from '../../domain/enums/severidad-alergia.enum';

export class AbrirHistoriaDto {
  @ApiPropertyOptional({ example: 'A+' })
  @IsOptional() @IsString() @MaxLength(5)
  grupoSanguineo?: string;
}

export class RegistrarAlergiaDto {
  @ApiProperty() @IsString() @IsNotEmpty() sustancia: string;
  @ApiProperty({ enum: SeveridadAlergia }) @IsEnum(SeveridadAlergia) severidad: SeveridadAlergia;
}

export class RegistrarAntecedenteDto {
  @ApiProperty({ example: 'madre' }) @IsString() @IsNotEmpty() parentesco: string;
  @ApiProperty() @IsString() @IsNotEmpty() descripcion: string;
}

export class AgregarEvolucionDto {
  @ApiProperty() @IsString() @IsNotEmpty() nota: string;
}
