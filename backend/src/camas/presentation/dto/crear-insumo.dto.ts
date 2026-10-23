import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CrearInsumoDto {
  @ApiProperty({ example: 'Ampolla paracetamol' }) @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ example: 'unidad' }) @IsString() @IsNotEmpty() unidad: string;

  @ApiProperty({ example: 5, description: 'Debajo de este stock se dispara la alerta' })
  @IsInt()
  @Min(0)
  umbralMinimo: number;

  @ApiPropertyOptional({ example: '120.50', description: 'Se envía como texto, con hasta 2 decimales' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'El precio debe ser un número con hasta 2 decimales' })
  precioUnitario?: string;
}
